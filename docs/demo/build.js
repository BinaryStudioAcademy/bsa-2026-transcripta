#!/usr/bin/env node
// Rendering the demo: scene.html → Playwright (webm) → ffmpeg (mp4 1920×1080).
//
// The trick: the scene plays back SLOW times slower and the edit compresses
// time back. Playwright drops frames during motion, and without this the
// transitions read as stutter.
//
//   npm run demo         full render to docs/demo/out/transcripta-demo.mp4
//   npm run demo:shots   stills only, into out/shots (a fast check)
//   npm run demo:setup   one-off: fetch Playwright + Chromium into .cache

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, "out");
// Playwright lives here rather than in the root devDependencies: it is ~400 MB
// with its browser, and everyone's `npm ci` would pay for a video rendered
// twice a year. `.cache` is git-ignored and nothing else in the repo sees it.
const CACHE = path.join(DIR, ".cache");
const PLAYWRIGHT_VERSION = "1.61.1";
const W = 1920,
	H = 1080;
const SLOW = 2; // how many times slower we record
const TAIL_MS = 400; // recorded after __done so the last frame is not cut

const cachedPlaywright = path.join(CACHE, "node_modules", "playwright");

/**
 * An installed Playwright as { mod, dir }, or null. `dir` is the package root,
 * which is where `cli.js` lives — the browser downloader has to come from the
 * same copy as the library, or it fetches a build the library will not use.
 */
function findPlaywright() {
	const candidates = ["playwright", cachedPlaywright];
	if (process.env.PLAYWRIGHT_PATH)
		candidates.unshift(process.env.PLAYWRIGHT_PATH);
	for (const p of candidates) {
		try {
			return {
				mod: require(p),
				dir: path.dirname(require.resolve(`${p}/package.json`)),
			};
		} catch (_) {
			/* try the next one */
		}
	}
	return null;
}

const has = (bin) => {
	try {
		execFileSync(bin, ["-version"], { stdio: "ignore" });
		return true;
	} catch (_) {
		return false;
	}
};

function run(cmd, args) {
	const r = spawnSync(cmd, args, { stdio: "inherit" });
	if (r.status !== 0)
		throw new Error(`${cmd} ${args.join(" ")} — exited with ${r.status}`);
}

/** `--setup`: everything the render needs, fetched once. Safe to re-run. */
function setup() {
	if (!has("ffmpeg") || !has("ffprobe")) {
		throw new Error(
			"ffmpeg is missing and cannot be installed for you. Run: brew install ffmpeg",
		);
	}
	console.log("ffmpeg: ok");

	let pw = findPlaywright();
	if (pw) {
		console.log(`playwright: already available (${pw.dir})`);
	} else {
		console.log(
			`installing playwright ${PLAYWRIGHT_VERSION} into docs/demo/.cache …`,
		);
		fs.mkdirSync(CACHE, { recursive: true });
		run("npm", [
			"install",
			"--prefix",
			CACHE,
			"--no-save",
			"--no-audit",
			"--no-fund",
			`playwright@${PLAYWRIGHT_VERSION}`,
		]);
		pw = findPlaywright();
		if (!pw)
			throw new Error(
				"npm reported success but playwright still does not resolve",
			);
	}

	// Idempotent: prints "is already installed" and exits 0 when the browser is there.
	console.log("fetching the chromium build…");
	run("node", [path.join(pw.dir, "cli.js"), "install", "chromium"]);

	console.log("\nready. Render it with: npm run demo");
}

function requireFfmpeg() {
	for (const bin of ["ffmpeg", "ffprobe"]) {
		if (!has(bin)) throw new Error(`${bin} not found. Run: npm run demo:setup`);
	}
}

const durationMs = (f) =>
	Math.round(
		parseFloat(
			execFileSync("ffprobe", [
				"-v",
				"error",
				"-show_entries",
				"format=duration",
				"-of",
				"csv=p=0",
				f,
			]).toString(),
		) * 1000,
	);

/** Where the black head ends (fonts, first frame). Measured, not guessed. */
function measureHead(webm) {
	const r = spawnSync(
		"ffmpeg",
		[
			"-hide_banner",
			"-nostats",
			"-i",
			webm,
			"-vf",
			"blackdetect=d=0.10:pix_th=0.02:pic_th=0.98",
			"-f",
			"null",
			"-",
		],
		{ encoding: "utf8" },
	);
	for (const seg of String(r.stderr || "").match(
		/black_start:([\d.]+)\s+black_end:([\d.]+)/g,
	) || []) {
		const [, s, e] = seg.match(/black_start:([\d.]+)\s+black_end:([\d.]+)/);
		if (parseFloat(s) < 0.25) return Math.round(parseFloat(e) * 1000);
	}
	console.warn("  no black head found — using 0");
	return 0;
}

async function main() {
	if (process.argv.includes("--setup")) return setup();

	const shotsOnly = process.argv.includes("--shots");
	requireFfmpeg();
	fs.mkdirSync(OUT, { recursive: true });

	const pw = findPlaywright();
	if (!pw)
		throw new Error("playwright not found. Run once: npm run demo:setup");

	const { chromium } = pw.mod;
	let browser;
	try {
		browser = await chromium.launch();
	} catch (e) {
		// Almost always the library without its browser — a separate download.
		throw new Error(
			`chromium failed to launch. Run once: npm run demo:setup\n\n  ${e.message.split("\n")[0]}`,
		);
	}
	const ctx = await browser.newContext({
		viewport: { width: W, height: H },
		deviceScaleFactor: 1,
		...(shotsOnly
			? {}
			: { recordVideo: { dir: OUT, size: { width: W, height: H } } }),
	});
	const page = await ctx.newPage();
	let pageErr = null;
	page.on("pageerror", (e) => {
		pageErr = e.message;
	});
	await page.addInitScript(
		(slow) => {
			window.__SLOW = slow;
		},
		shotsOnly ? 1 : SLOW,
	);
	await page.goto("file://" + path.join(DIR, "scene.html"));

	if (shotsOnly) {
		const shots = path.join(OUT, "shots");
		fs.rmSync(shots, { recursive: true, force: true });
		fs.mkdirSync(shots, { recursive: true });
		let i = 0;
		// Take a still at every marker the scene announces. The scene's own names
		// already carry the order, so they are used as-is.
		await page.exposeFunction("__shot", async (name) => {
			i++;
			await page.screenshot({ path: path.join(shots, `${name}.png`) });
		});
		await page.evaluate(() => {
			window.__shotsMode = true;
		});
		await page.evaluate(() => window.__start());
		await page.waitForFunction(() => window.__done === true, null, {
			timeout: 600000,
		});
		if (pageErr) throw new Error("page error: " + pageErr);
		await ctx.close();
		await browser.close();
		console.log(`stills: ${shots} (${i} of them)`);
		return;
	}

	console.log("recording the scene…");
	await page.evaluate(() => window.__start());
	await page.waitForFunction(() => window.__done === true, null, {
		timeout: 600000,
	});
	await page.waitForTimeout(TAIL_MS);
	const sceneErr = await page.evaluate(() => window.__sceneError || null);
	await ctx.close();
	await browser.close();
	if (pageErr) throw new Error("page error: " + pageErr);
	if (sceneErr) throw new Error("scene error: " + sceneErr);

	const webm = path.join(
		OUT,
		fs
			.readdirSync(OUT)
			.filter((f) => f.endsWith(".webm"))
			.pop(),
	);
	const headMs = measureHead(webm);
	const raw = durationMs(webm);
	const mp4 = path.join(OUT, "transcripta-demo.mp4");
	console.log(
		`  recording ${(raw / 1000).toFixed(1)} s, black head ${headMs} ms`,
	);

	execFileSync(
		"ffmpeg",
		[
			"-y",
			"-hide_banner",
			"-loglevel",
			"error",
			"-ss",
			(headMs / 1000).toFixed(3),
			"-i",
			webm,
			"-vf",
			`setpts=PTS/${SLOW},fps=30,scale=${W}:${H}:flags=lanczos`,
			"-c:v",
			"libx264",
			"-preset",
			"slow",
			"-crf",
			"18",
			"-pix_fmt",
			"yuv420p",
			"-movflags",
			"+faststart",
			"-an",
			mp4,
		],
		{ stdio: "inherit" },
	);

	fs.unlinkSync(webm);
	console.log(`done: ${mp4}  (${(durationMs(mp4) / 1000).toFixed(1)} s)`);
}

main().catch((e) => {
	console.error("\n" + e.message + "\n");
	process.exit(1);
});

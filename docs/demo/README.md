# Demo video

An animation of Transcripta from the user's point of view — from uploading a
PDF to exporting CSV. No voiceover, 1920×1080, ~110 seconds.

```bash
npm run demo:setup     # once: fetches Playwright + Chromium (~540 MB, ~1 min)
npm run demo           # → docs/demo/out/transcripta-demo.mp4
npm run demo:shots     # stills into out/shots — seconds, not minutes
```

`demo:setup` is idempotent: re-run it any time, it only fetches what is
missing. The one thing it cannot install for you is `ffmpeg` — it checks and
tells you to `brew install ffmpeg`. If Playwright is already somewhere on the
machine, `PLAYWRIGHT_PATH` points at it and the download is skipped.

**Playwright is deliberately not a devDependency.** With its browser it is
~540 MB, and every `npm ci` — including CI — would pay for a video rendered
twice a year. `demo:setup` puts it in `docs/demo/.cache` instead, so the
workspace install stays untouched. Both `.cache/` and `out/` are git-ignored.

Rendering takes about four minutes: the scene is recorded twice as slow as it
plays (see below), so 110 seconds of video is ~223 seconds of recording plus
the encode.

## What is inside

| File         | What it is                                                 |
| ------------ | ---------------------------------------------------------- |
| `scene.html` | the whole animation: markup, styles and script in one file |
| `build.js`   | records the scene with Playwright and edits it into mp4    |

In practice only `scene.html` is edited: the `scene()` function at the bottom
is a sequence of steps, each with its own chapter title (`chapter`) and caption
(`note`).

## The script

The demo shows the product as a working web app — sidebar, browser chrome,
real URLs — rather than abstract boxes.

| Step   | What it shows                                                  |
| ------ | -------------------------------------------------------------- |
| title  | what the system is                                             |
| 1      | a workspace of documents: budget, progress, status per row     |
| 2      | upload: the file goes straight to storage, a preset is picked  |
| 3      | splitting into pages; two blank pages are detected and skipped |
| 4      | the verification screen: scan left, transcription right        |
| 5      | the model gets a name wrong, the human corrects it             |
| 6      | the next page already knows the word — the payoff              |
| 7      | a skipped page does not feed the context                       |
| 8      | the preset editor: instructions and glossary, schema locked    |
| 9      | export with an honest warning about unverified pages           |
| finale | the loop: confirm → lexicon → better reading                   |

Everything in it matches the documented design — the same flow as
[02-data-pipeline.md](../02-data-pipeline.md) and
[06-verification-ui.md](../06-verification-ui.md), down to the blank pages,
the budget counter and the two-page threshold before a word enters the prompt.

## Three technical details, without which it does not work

**Playback pace is one constant.** Every dwell in the scene goes through
`pause()`, which multiplies it by `PACE`. Captions are the slowest thing on
screen to consume, so the pace is set by how long they take to read, not by
how long an animation runs — raise `PACE` and the whole video stretches evenly.
It is unrelated to `SLOW` below.

**We record twice as slow as we play.** Playwright drops frames during motion
and transitions read as stutter. The scene plays at `SLOW = 2` and `ffmpeg`
compresses time back with `setpts`, so twice as many frames land on the same
second of motion.

**The black cap at the start is load-bearing.** `scene.html` holds a black
overlay for a moment before anything else. `build.js` finds it with
`blackdetect` and cuts everything before it, so the video never opens on a
half-laid-out page. Remove the hold and the trim silently stops working —
the log then says `no black head found`.

**In `--shots` mode animations are switched off.** The `__shotsMode` flag is
set after the page loads, so the `nofx` class is applied at the start of the
scene rather than when the functions are defined. Otherwise a still catches
the middle of a transition and two panels appear at once.

## When editing the scene

`build.js` expects a small contract from `scene.html`: `window.__start()`,
`window.__done`, `window.__sceneError`, `window.__SLOW`, `window.__shotsMode`
with `window.__shot(name)`, and the `#cap` overlay. Keep those and the rest of
the file is free.

The scene is plain HTML and CSS with no build step and no dependencies, which
is why it is worth keeping it that way: a demo that needs its own toolchain
stops being rendered.

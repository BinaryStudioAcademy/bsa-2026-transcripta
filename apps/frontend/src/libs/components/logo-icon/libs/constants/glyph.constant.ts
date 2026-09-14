const GLYPH = {
	large: {
		crossbar: "M9 13 L39 9.5 L37.4 15.2 L10.6 17.4 Z",
		dot: { cx: 30.5, cy: 39.5, r: 2.2 },
		stem: "M20.8 14.6 L27.6 13.9 L25.2 41.5 L23.4 41.5 Z",
	},
	small: {
		crossbar: "M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z",
		dot: { cx: 33.5, cy: 38.5, r: 3.4 },
		stem: "M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z",
	},
} as const;

export { GLYPH };

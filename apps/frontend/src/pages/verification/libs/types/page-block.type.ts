type PageBlock =
	| { rows: string[][]; type: "table" }
	| { text: string; type: "text" };

export { type PageBlock };

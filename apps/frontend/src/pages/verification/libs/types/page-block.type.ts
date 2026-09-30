import { PageCell } from "./page-cell.type.js";

type PageBlock =
	| { rows: PageCell[][]; type: "table" }
	| { start: number; text: string; type: "text" };

export { type PageBlock };

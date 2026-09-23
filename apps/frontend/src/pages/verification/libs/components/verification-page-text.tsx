import { FIRST_INDEX } from "~/libs/constants/constants.js";
import { useMemo } from "~/libs/hooks/hooks.js";

import { markUnreadable } from "../helpers/mark-unreadable.helper.js";
import { splitPageBlocks } from "../helpers/split-page-blocks.helper.js";
import { type PageBlock } from "../types/types.js";

type Properties = {
	text: string;
};

const VerificationPageText: React.FC<Properties> = ({ text }: Properties) => {
	const blocks = useMemo(() => splitPageBlocks(text), [text]);

	return (
		<div className="verification-transcription__text">
			{blocks.map((block: PageBlock, blockIndex: number) => {
				if (block.type === "table") {
					const [head, ...body] = block.rows;

					return (
						<table
							className="verification-transcription__table"
							key={blockIndex}
						>
							<thead>
								<tr>
									{(head ?? []).map((cell: string, cellIndex: number) => (
										<th key={cellIndex}>{markUnreadable(cell)}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{body.map((row: string[], rowIndex: number) => (
									<tr key={rowIndex}>
										{row.map((cell: string, cellIndex: number) => (
											<td key={cellIndex}>{markUnreadable(cell)}</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					);
				}

				return (
					<p className="verification-transcription__paragraph" key={blockIndex}>
						{markUnreadable(block.text)}
					</p>
				);
			})}
			{blocks.length === FIRST_INDEX && (
				<p className="verification-transcription__paragraph">
					{markUnreadable(text)}
				</p>
			)}
		</div>
	);
};

export { VerificationPageText };

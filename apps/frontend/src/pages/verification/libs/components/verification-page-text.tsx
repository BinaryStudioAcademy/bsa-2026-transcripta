import { EMPTY_LENGTH } from "~/libs/constants/common.constants.js";
import { FIRST_INDEX } from "~/libs/constants/constants.js";
import { useMemo } from "~/libs/hooks/hooks.js";

import { markText } from "../helpers/mark-text.helper.js";
import { normalizeContextWords } from "../helpers/normalize-context-words.helper.js";
import { splitPageBlocks } from "../helpers/split-page-blocks.helper.js";
import {
	type DocumentGetPagesContextWordResponseDto,
	type PageBlock,
	type PageCell,
} from "../types/types.js";

type Properties = {
	contextWords: DocumentGetPagesContextWordResponseDto[];
	text: string;
};

const VerificationPageText: React.FC<Properties> = ({
	contextWords,
	text,
}: Properties) => {
	const blocks = useMemo(() => splitPageBlocks(text), [text]);
	const lexiconWords = useMemo(
		() => normalizeContextWords({ contextWords, text }),
		[contextWords, text],
	);

	return (
		<div className="verification-transcription__text">
			{blocks.map((block: PageBlock, blockIndex: number) => {
				if (block.type === "table") {
					const [head, ...body] = block.rows;

					return (
						<div
							className="verification-transcription__table-scroll"
							key={blockIndex}
						>
							<table className="verification-transcription__table">
								<thead>
									<tr>
										{(head ?? []).map((cell: PageCell, cellIndex: number) => (
											<th key={cellIndex}>
												{markText({
													contextWords: lexiconWords,
													segment: cell.text,
													segmentStart: cell.start,
												})}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{body.map((row: PageCell[], rowIndex: number) => (
										<tr key={rowIndex}>
											{row.map((cell: PageCell, cellIndex: number) => (
												<td key={cellIndex}>
													{markText({
														contextWords: lexiconWords,
														segment: cell.text,
														segmentStart: cell.start,
													})}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					);
				}

				return (
					<p className="verification-transcription__paragraph" key={blockIndex}>
						{markText({
							contextWords: lexiconWords,
							segment: block.text,
							segmentStart: block.start,
						})}
					</p>
				);
			})}
			{blocks.length === FIRST_INDEX && (
				<p className="verification-transcription__paragraph">{text}</p>
			)}
		</div>
	);
};

export { VerificationPageText };

import { type DocumentGetLexiconItemResponseDto } from "@transcripta/shared";

import { Button } from "~/libs/components/components.js";
import { useCallback } from "~/libs/hooks/hooks.js";

import styles from "./styles.module.css";

const SINGLE_PAGE_COUNT = 1;

type Properties = {
	entry: DocumentGetLexiconItemResponseDto;
	isDisabled: boolean;
	onMarkWrong: (entry: DocumentGetLexiconItemResponseDto) => void;
};

const formatKind = (kind: string): string => kind.replaceAll("_", " ");

const LexiconEntryRow: React.FC<Properties> = ({
	entry,
	isDisabled,
	onMarkWrong,
}: Properties) => {
	const handleMarkWrong = useCallback((): void => {
		onMarkWrong(entry);
	}, [entry, onMarkWrong]);

	return (
		<li className={styles["row"]}>
			<span className={styles["word"]}>{entry.valueDisplay}</span>
			<span className={styles["kind"]}>{formatKind(entry.kind)}</span>
			<span className={["tx-num", styles["pages"]].join(" ")}>
				seen on {entry.distinctPages}{" "}
				{entry.distinctPages === SINGLE_PAGE_COUNT ? "page" : "pages"}
			</span>
			<span className={styles["action"]}>
				<Button
					isDisabled={isDisabled}
					isSecondary
					isSmall
					label="Mark wrong"
					onClick={handleMarkWrong}
				/>
			</span>
		</li>
	);
};

export { LexiconEntryRow };

import { OverflowMenu } from "~/libs/components/components.js";
import { useOverflowTooltip } from "~/libs/hooks/hooks.js";
import { type ValueOf } from "~/libs/types/types.js";
import { DocumentStatus } from "~/modules/documents/libs/enums/enums.js";

import { DocumentStatusBlock } from "../document-status-block/document-status-block.js";
import styles from "./styles.module.css";

type Properties = {
	documentId: number;
	onDeleteClick: () => void;
	pageCount: number;
	presetName: string;
	status: ValueOf<typeof DocumentStatus>;
	title: string;
};

const DocumentTitleBlock: React.FC<Properties> = ({
	documentId,
	onDeleteClick,
	pageCount,
	presetName,
	status,
	title,
}: Properties) => {
	const { checkTruncation, elementReference, isTruncated } =
		useOverflowTooltip<HTMLHeadingElement>(title);

	return (
		<div className={styles["title-row"]}>
			<div className={styles["title-line"]}>
				<div
					className={[styles["title-wrapper"], isTruncated && "tx-tip"]
						.filter(Boolean)
						.join(" ")}
					data-tip={isTruncated ? title : undefined}
					onMouseEnter={checkTruncation}
				>
					<h1 className={styles["title"]} ref={elementReference}>
						{title}
					</h1>
				</div>
				<DocumentStatusBlock documentId={documentId} status={status} />
				<div className={styles["title-spacer"]} />
				<OverflowMenu
					items={[
						{
							isDanger: true,
							label: "Delete",
							onClick: onDeleteClick,
						},
					]}
				/>
			</div>
			<p className={styles["meta"]}>
				<span className="tx-num">{pageCount}</span> pages · Preset: {presetName}
			</p>
		</div>
	);
};

export { DocumentTitleBlock };

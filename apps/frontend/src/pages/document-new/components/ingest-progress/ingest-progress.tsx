import { Loader } from "~/libs/components/components.js";
import { LoaderSize } from "~/libs/enums/enums.js";

type Properties = {
	onOpenDocument: () => void;
	title: string;
};

const IngestProgress: React.FC<Properties> = ({
	onOpenDocument,
	title,
}: Properties) => {
	return (
		<div className="tx-state">
			<h3 className="tx-state-h">Reading the first page</h3>
			<p className="tx-state-reason">
				{title} is split into pages and the model is reading the first one. This
				takes a few seconds, then verification opens by itself.
			</p>
			<Loader label="Preparing pages" size={LoaderSize.SMALL} />
			<div className="tx-state-actions">
				<button
					className="tx-btn tx-btn--ghost"
					onClick={onOpenDocument}
					type="button"
				>
					Open the document page instead
				</button>
			</div>
		</div>
	);
};

export { IngestProgress };

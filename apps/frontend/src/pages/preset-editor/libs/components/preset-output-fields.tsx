import React from "react";

type Properties = {
	fields: string[];
};

const PresetOutputFields: React.FC<Properties> = ({ fields }) => {
	return (
		<div className="preset-editor__output-section">
			<div className="preset-editor__output-heading">
				<svg
					aria-hidden="true"
					fill="none"
					height="13"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					viewBox="0 0 24 24"
					width="13"
				>
					<rect height="11" rx="2" width="18" x="3" y="11" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>

				<span className="tx-label">
					Output fields (from the template, not editable)
				</span>
			</div>

			<div className="preset-editor__output-fields">
				{fields.map((field) => (
					<span className="preset-editor__output-item" key={field}>
						<span className="preset-editor__output-chip">{field}</span>
						<span className="preset-editor__output-separator">·</span>
					</span>
				))}
			</div>
		</div>
	);
};

export { PresetOutputFields };

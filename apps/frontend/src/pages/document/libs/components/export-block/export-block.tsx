import { Button } from "~/libs/components/components.js";

import { DocumentSection } from "../document-section/document-section.js";
import styles from "./styles.module.css";

const ExportBlock: React.FC = () => (
	<DocumentSection
		action={
			<Button isSecondary isSmall>
				Export...
			</Button>
		}
		title="Export"
	>
		<p className={styles["note"]}>
			Exports include every page — unverified pages are exported as the model
			read them.
		</p>
	</DocumentSection>
);

export { ExportBlock };

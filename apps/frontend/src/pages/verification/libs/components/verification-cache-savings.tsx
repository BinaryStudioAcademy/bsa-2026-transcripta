import { getCacheSavings } from "../helpers/get-cache-savings.helper.js";

type VerificationCacheSavingsProperties = {
	savedUsd: null | string | undefined;
};

// Quiet, and part of the page rather than a transient event: the amount is a
// property of this transcription, so it has to still be there when the human
// comes back to the page. The tooltip is hover-only, like the context-word
// marks — a focusable chip would steal `Enter` from the confirm shortcut.
const VerificationCacheSavings: React.FC<
	VerificationCacheSavingsProperties
> = ({ savedUsd }) => {
	const savings = getCacheSavings(savedUsd);

	if (!savings) {
		return null;
	}

	return (
		<span
			className="tx-chip tx-chip--ok tx-tip verification-transcription__savings"
			data-tip={savings.tip}
		>
			{savings.prefix}
			<span className="tx-chip__icon">{savings.amount}</span>
		</span>
	);
};

export { VerificationCacheSavings };

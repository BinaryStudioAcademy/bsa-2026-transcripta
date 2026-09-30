import { getCacheSavings } from "../helpers/get-cache-savings.helper.js";

type VerificationCacheSavingsProperties = {
	savedUsd: null | string | undefined;
};

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

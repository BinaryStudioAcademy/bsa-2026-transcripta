const DAYS_BEFORE_TODAY_FOR_YESTERDAY = 1;
const LOCALE = "en-GB";

const isSameDay = (first: Date, second: Date): boolean =>
	first.toDateString() === second.toDateString();

const formatExportDate = (isoDate: string): string => {
	const date = new Date(isoDate);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - DAYS_BEFORE_TODAY_FOR_YESTERDAY);

	const time = date.toLocaleTimeString(LOCALE, {
		hour: "2-digit",
		minute: "2-digit",
	});

	if (isSameDay(date, today)) {
		return `today, ${time}`;
	}

	if (isSameDay(date, yesterday)) {
		return `yesterday, ${time}`;
	}

	const day = date.toLocaleDateString(LOCALE, {
		day: "numeric",
		month: "short",
	});

	return `${day}, ${time}`;
};

export { formatExportDate };

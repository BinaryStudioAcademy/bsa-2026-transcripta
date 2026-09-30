type NavigatorWithUserAgentData = Navigator & {
	userAgentData?: {
		platform: string;
	};
};

const getIsMacOs = (): boolean => {
	if (!("navigator" in globalThis)) {
		return false;
	}

	const navigatorWithUserAgentData =
		globalThis.navigator as NavigatorWithUserAgentData;

	return navigatorWithUserAgentData.userAgentData?.platform === "macOS";
};

export { getIsMacOs };

import { BEARER_AUTHORIZATION_PATTERN } from "~/libs/modules/auth/libs/constants/constants.js";

const extractBearerToken = (authorizationHeader: string): null | string => {
	return (
		BEARER_AUTHORIZATION_PATTERN.exec(authorizationHeader)?.groups?.["token"] ??
		null
	);
};

export { extractBearerToken };

import { type HTTPMethodValue } from "./http-method.type.js";

type HTTPOptions = {
	headers: Headers;
	method: HTTPMethodValue;
	payload: BodyInit | null;
};

export { type HTTPOptions };

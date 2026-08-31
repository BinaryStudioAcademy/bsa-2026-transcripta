import { type ValueOf } from "../../../../types/types.js";
import { HTTPMethod } from "../enums/http-method.enum.js";

type HTTPMethodType = ValueOf<typeof HTTPMethod>;

export { type HTTPMethodType };

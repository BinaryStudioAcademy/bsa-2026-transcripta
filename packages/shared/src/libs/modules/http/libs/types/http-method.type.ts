import { type ValueOf } from "../../../../types/types.js";
import { HTTPMethod } from "../enums/http-method.enum.js";

type HTTPMethodValue = ValueOf<typeof HTTPMethod>;

export { type HTTPMethodValue };

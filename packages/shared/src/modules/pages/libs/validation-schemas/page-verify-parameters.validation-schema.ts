import { z } from "zod";

const verifyPageParameters = z.object({
	id: z.coerce.number().int().positive(),
});

export { verifyPageParameters };

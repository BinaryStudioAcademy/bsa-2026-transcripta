import { z } from "zod";

const reprocessPageParameters = z.object({
	id: z.coerce.number().int().positive(),
});

export { reprocessPageParameters };

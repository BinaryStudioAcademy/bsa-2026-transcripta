import { type Redis } from "ioredis";

import { ConnectionStatuses } from "../constants/constants.js";

/**
 * Every Redis connection the process opens — the queue registry one, the rate
 * limiter one — has to be closed by us, because a single open socket is enough
 * to keep the event loop alive and stop the process from exiting.
 */
const closeRedisConnection = async (
	connection: null | Redis,
): Promise<void> => {
	if (!connection || connection.status === ConnectionStatuses.END) {
		return;
	}

	if (connection.status === ConnectionStatuses.READY) {
		await connection.quit();

		return;
	}

	// Still connecting, reconnecting or waiting: QUIT would never settle, so
	// drop the socket instead.
	connection.disconnect();
};

export { closeRedisConnection };

import { toast } from "react-toastify";

class BaseNotification {
	public error(message: string): void {
		toast.error(message);
	}

	public info(message: string): void {
		toast.info(message);
	}
}

export { BaseNotification };

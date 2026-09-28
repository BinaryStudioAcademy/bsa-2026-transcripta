import { toast } from "react-toastify";

class BaseNotification {
	public error(message: string): void {
		toast.error(message);
	}

	public info(message: string): void {
		toast.info(message);
	}

	public success(message: string): void {
		toast.success(message);
	}
}

export { BaseNotification };

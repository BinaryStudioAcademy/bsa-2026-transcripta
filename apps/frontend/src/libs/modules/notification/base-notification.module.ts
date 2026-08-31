import { toast } from "react-toastify";

class BaseNotification {
	public error(message: string): void {
		toast.error(message);
	}
}

export { BaseNotification };

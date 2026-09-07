import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";

import "~/assets/css/styles.css";
import {
	App,
	ProtectedRoute,
	RouterProvider,
	StoreProvider,
} from "~/libs/components/components.js";
import { AppRoute } from "~/libs/enums/enums.js";
import { store } from "~/libs/modules/store/store.js";
import { Auth } from "~/pages/auth/auth.jsx";
import { DocumentNew } from "~/pages/document-new/document-new.jsx";
import { Document } from "~/pages/documents/document.jsx";
import { Documents } from "~/pages/documents/documents.jsx";
import { NotFound } from "~/pages/not-found/not-found.jsx";
import { Test } from "~/pages/test/test.jsx";

createRoot(document.querySelector("#root") as HTMLElement).render(
	<StrictMode>
		<StoreProvider store={store.instance}>
			<RouterProvider
				routes={[
					{
						children: [
							{
								element: <Auth />,
								path: AppRoute.SIGN_IN,
							},
							{
								element: <Auth />,
								path: AppRoute.SIGN_UP,
							},
							{
								children: [
									{
										element: <Documents />,
										path: AppRoute.ROOT,
									},
									{
										element: <Document />,
										path: AppRoute.DOCUMENT,
									},
									{
										element: <Test />,
										path: AppRoute.TEST,
									},
								],
								element: <ProtectedRoute />,
							},
							{
								element: <DocumentNew />,
								path: AppRoute.DOCUMENTS_NEW,
							},
						],
						element: <App />,
						path: AppRoute.ROOT,
					},
					{
						element: <NotFound />,
						path: "*",
					},
				]}
			/>
			<ToastContainer />
		</StoreProvider>
	</StrictMode>,
);

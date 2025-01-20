import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { Provider } from "react-redux";
import store from "./store/store.js";
import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Editor from "./pages/Editor.jsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Navigate to="/home" replace={true} />,
	},
	{
		path: "/home",
		element: <Home />,
	},
	{
		path: "/editor",
		element: <Editor />,
	},
]);

createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>
	</Provider>
);

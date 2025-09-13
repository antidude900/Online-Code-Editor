import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { Provider } from "react-redux";
import store from "./redux/store.js";
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
		element: <Navigate to="/editor" replace={true} />,
	},
	{
		path: "/homeTest",
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

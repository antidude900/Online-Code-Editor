import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Editor from "./pages/Editor.jsx";
import { useVerifyUserQuery } from "./redux/api/userApiSlice.js";
import { setCredentials, logout } from "./redux/states/authSlice.js";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/editor",
		element: <Editor />,
	},
	{
		path: "/editor/:fileId",
		element: <Editor />,
	},
]);

const App = () => {
	const dispatch = useDispatch();
	const { data: userData, error } = useVerifyUserQuery();

	useEffect(() => {
		if (userData) {
			dispatch(setCredentials(userData));
		} else if (error) {
			dispatch(logout());
		}
	}, [userData, error, dispatch]);

	return <RouterProvider router={router} />;
};

export default App;

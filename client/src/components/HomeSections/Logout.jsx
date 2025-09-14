import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/userApiSlice";
import { LogOut } from "lucide-react";
import { logout } from "../../redux/states/authSlice";

const Logout = () => {
	const dispatch = useDispatch();

	const [logoutApi, { isLoading }] = useLogoutMutation();

	async function logoutHandler() {
		try {
			await logoutApi().unwrap();
			dispatch(logout());
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<LogOut
			onClick={logoutHandler}
			disabled={isLoading}
			className={`${
				isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
			}`}
		/>
	);
};

export default Logout;

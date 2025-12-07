import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/redux/api/userApiSlice";
import { LogOut } from "lucide-react";
import { logout } from "@/redux/states/authSlice";
import { apiSlice } from "@/redux/api/apiSlice";
import styles from "./Logout.module.css";

const Logout = () => {
	const dispatch = useDispatch();

	const [logoutApi, { isLoading }] = useLogoutMutation();

	async function logoutHandler() {
		try {
			await logoutApi().unwrap();
			dispatch(logout());
			dispatch(apiSlice.util.resetApiState());
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<LogOut
			onClick={logoutHandler}
			disabled={isLoading}
			className={isLoading ? styles.logout__iconDisabled : styles.logout__icon}
		/>
	);
};

export default Logout;

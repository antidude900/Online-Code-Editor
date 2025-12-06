import { useSelector } from "react-redux";
import Logout from "@/components/shared/Logout";
import WorkspaceExplorer from "@/components/shared/WorkspaceExplorer";
import AuthForm from "@/components/shared/AuthForm";
import styles from "./index.module.css";

const RightSection = () => {
	const { userInfo, isLoading } = useSelector((state) => state.auth);

	if (isLoading) {
		return <></>;
	}

	return (
		<div className={styles.rightSection__container}>
			{userInfo ? (
				<>
					<div className={styles.rightSection__workspaceContainer}>
						<WorkspaceExplorer />
					</div>

					<div className={styles.rightSection__logoutButtonContainer}>
						<Logout />
					</div>
				</>
			) : (
				<div className={styles.rightSection__authContainer}>
					<AuthForm />
				</div>
			)}
		</div>
	);
};

export default RightSection;

import { useSelector } from "react-redux";
import Logout from "./Logout";
import WorkspaceExplorer from "../WorkspaceExplorer";
import AuthForm from "./AuthForm";

const RightSection = () => {
	const { userInfo } = useSelector((state) => state.auth);

	return (
		<div className="flex-1 flex items-center justify-center">
			{userInfo ? (
				<>
					<div className="w-full p-8 h-[80%]">
						<WorkspaceExplorer />
					</div>

					<div className="absolute top-4 right-4">
						<Logout />
					</div>
				</>
			) : (
				<div className="bg-[#282A36] p-8 rounded-2xl shadow-xl shadow-gray-900 w-full max-w-sm">
					<AuthForm />
				</div>
			)}
		</div>
	);
};

export default RightSection;

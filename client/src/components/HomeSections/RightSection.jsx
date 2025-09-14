import { useState } from "react";
import Register from "./Register";
import Login from "./Login";
import { useSelector } from "react-redux";
import Logout from "./Logout";

const RightSection = () => {
	const [loginMode, setLoginMode] = useState(true);
	const { userInfo } = useSelector((state) => state.auth);

	return (
		<div className="flex-1 flex items-center justify-center">
			{userInfo ? (
				<>
					<div>No Files Saved</div>
					<div className="absolute top-4 right-4">
						<Logout />
					</div>
				</>
			) : (
				<div className="bg-[#282A36] p-8 rounded-2xl shadow-xl shadow-gray-900 w-full max-w-sm">
					{loginMode ? <Login /> : <Register />}
					<div
						onClick={() => setLoginMode(!loginMode)}
						className="text-sm font-medium text-blue-500 hover:text-blue-700 underline cursor-pointer mt-6 text-center"
					>
						{loginMode ? "Create an Account" : "Already have an account"}
					</div>
				</div>
			)}
		</div>
	);
};

export default RightSection;

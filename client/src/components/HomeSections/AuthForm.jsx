import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthForm = () => {
    const [loginMode, setLoginMode] = useState(true);
	return (
		<>
			{loginMode ? <Login /> : <Register />}
			<div
				onClick={() => setLoginMode(!loginMode)}
				className="text-sm font-medium text-blue-500 hover:text-blue-700 underline cursor-pointer mt-6 text-center"
			>
				{loginMode ? "Create an Account" : "Already have an account"}
			</div>
		</>
	);
};

export default AuthForm;

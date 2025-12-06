import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import styles from "./index.module.css";

const AuthForm = () => {
	const [loginMode, setLoginMode] = useState(true);
	return (
		<>
			{loginMode ? <Login /> : <Register />}
			<div
				onClick={() => setLoginMode(!loginMode)}
				className={styles.authForm__toggleButton}
			>
				{loginMode ? "Create an Account" : "Already have an account"}
			</div>
		</>
	);
};

export default AuthForm;

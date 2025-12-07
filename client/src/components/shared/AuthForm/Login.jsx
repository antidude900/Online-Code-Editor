import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@/redux/api/userApiSlice";
import { setCredentials } from "@/redux/states/authSlice";
import styles from "./Login.module.css";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const dispatch = useDispatch();

	const [login, { isLoading, error: LoginError }] = useLoginMutation();

	function validation(type) {
		switch (type) {
			case "email":
				return {
					required: true,
				};

			case "password":
				return {
					required: true,
					minLength: 6,
					maxLength: 20,
					pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$",
					title:
						"Password must be 6–20 characters and include at least one letter and one number",
				};

			default:
				return {};
		}
	}

	async function submitHandler(e) {
		e.preventDefault();

		const form = e.target;
		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		try {
			const res = await login({ email, password }).unwrap();
			dispatch(setCredentials({ ...res }));
			console.log("successfully logged in");
		} catch (err) {
			throw new Error(err?.data?.message || err.error);
		}
	}
	return (
		<form onSubmit={submitHandler}>
			<div className={styles.login__title}>Login</div>
			<div className={styles.login__formGroup}>
				<div className={styles.login__formGroupLabel}>Email</div>
				<input
					type="email"
					className={styles.login__formInput}
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					{...validation("email")}
				/>
			</div>
			<div className={styles.login__formGroupLast}>
				<div className={styles.login__formGroupLabel}>Password</div>
				<input
					type="password"
					className={styles.login__formInput}
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					{...validation("password")}
				/>
			</div>

			{LoginError &&
				LoginError.data.message === "Email or Password is incorrect!" && (
					<div className={styles.login__error}>
						{LoginError?.data?.message || "Email or Password is incorrect!"}
					</div>
				)}
			<button
				type="submit"
				disabled={isLoading}
				className={`${styles.login__button} ${
					isLoading ? styles.login__buttonDisabled : ""
				}`}
			>
				{isLoading ? "Logging in..." : "Login"}
			</button>
		</form>
	);
};

export default Login;

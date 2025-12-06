import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "@/redux/api/userApiSlice";
import { setCredentials } from "@/redux/states/authSlice";
import styles from "./Register.module.css";

const Register = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const dispatch = useDispatch();

	const [register, { isLoading, error: RegisterError }] = useRegisterMutation();

	function validation(type) {
		switch (type) {
			case "username":
				return {
					required: true,
					minLength: 3,
					maxLength: 15,
					pattern: "[a-zA-Z0-9_]+",
					title:
						"Username must contain only alphanumeric characters and underscores",
				};

			case "email":
				return {
					required: true,
				};

			case "password":
				return {
					required: true,
					minLength: 8,
					maxLength: 64,
					pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$",
					title:
						"Password must be 8–64 characters and include at least one letter and one number",
				};

			default:
				return {};
		}
	}
	const checkConfirmPassword = (e) => {
		const value = e.target.value;

		if (value !== password) {
			e.target.setCustomValidity("Passwords do not match");
		} else {
			e.target.setCustomValidity("");
		}
	};

	async function submitHandler(e) {
		e.preventDefault();
		const form = e.target;
		const confirmInput = form.elements["confirmPassword"];

		if (password !== confirmPassword) {
			confirmInput.setCustomValidity("Pp");
			return;
		}

		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		try {
			const res = await register({ username, email, password }).unwrap();
			dispatch(setCredentials({ ...res }));
			console.log("sucessfully registered");
		} catch (err) {
			throw new Error(err?.data?.message || err.error);
		}
	}

	return (
		<form onSubmit={submitHandler}>
			<div className={styles.register__title}>Create Account</div>

			<div className={styles.register__formGroup}>
				<div className={styles.register__formGroupLabel}>Username</div>
				<input
					type="text"
					className={styles.register__formInput}
					placeholder="Enter your username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					{...validation("username")}
				/>
			</div>

			<div className={styles.register__formGroup}>
				<div className={styles.register__formGroupLabel}>Email</div>
				<input
					type="email"
					className={styles.register__formInput}
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					{...validation("email")}
				/>
			</div>

			<div className={styles.register__formGroup}>
				<div className={styles.register__formGroupLabel}>Password</div>
				<input
					type="password"
					className={styles.register__formInput}
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					{...validation("password")}
				/>
			</div>

			<div className={styles.register__formGroupLast}>
				<div className={styles.register__formGroupLabel}>Confirm Password</div>
				<input
					type="password"
					name="confirmPassword"
					className={styles.register__formInput}
					placeholder="Confirm your password"
					value={confirmPassword}
					onChange={(e) => {
						setConfirmPassword(e.target.value);
						checkConfirmPassword(e);
					}}
				/>
			</div>

			{RegisterError &&
				RegisterError.data.message === "User already exists" && (
					<div className={styles.register__error}>{"Email already exists"}</div>
				)}

			<button
				type="submit"
				disabled={isLoading}
				className={`${styles.register__button} ${
					isLoading ? styles.register__buttonDisabled : ""
				}`}
			>
				{isLoading ? "Registering..." : "Register"}
			</button>
		</form>
	);
};

export default Register;

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/states/authSlice";

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
			<div className="text-2xl font-bold mb-6">Login</div>
			<div className="mb-4">
				<div className="text-sm font-medium mb-2">Email</div>
				<input
					type="email"
					className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					{...validation("email")}
				/>
			</div>
			<div className="mb-6">
				<div className="text-sm font-medium mb-2">Password</div>
				<input
					type="password"
					className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					{...validation("password")}
				/>
			</div>

			{LoginError && LoginError.data.message === "Incorrect Password" && (
				<div className="text-red-500 text-sm mb-4 text-center">
					{LoginError?.data?.message || "Incorrect Password"}
				</div>
			)}
			<button
				type="submit"
				disabled={isLoading}
				className={`w-full bg-blue-500 py-2 px-4 rounded hover:bg-blue-600 ${
					isLoading && "opacity-50 cursor-not-allowed"
				}`}
			>
				{isLoading ? "Logging in..." : "Login"}
			</button>
		</form>
	);
};

export default Login;

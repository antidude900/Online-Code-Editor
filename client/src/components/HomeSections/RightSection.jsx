const RightSection = () => {
	return (
		<div className="flex-1 flex items-center justify-center">
			<div className="bg-[#282A36] p-8 rounded-2xl shadow-xl shadow-gray-900 w-full max-w-sm">
				<div className="text-2xl font-bold mb-6">Login</div>
				<div className="mb-4">
					<div className="text-sm font-medium mb-2">Email</div>
					<input
						type="email"
						className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
						placeholder="Enter your email"
					/>
				</div>
				<div className="mb-6">
					<div className="text-sm font-medium mb-2">Password</div>
					<input
						type="password"
						className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
						placeholder="Enter your password"
					/>
				</div>
				<button className="w-full bg-blue-500 py-2 px-4 rounded hover:bg-blue-600">
					Sign In
				</button>

				<div className="text-sm font-medium text-blue-500 hover:text-blue-700 underline cursor-pointer mt-6 text-center">
					Create an Account
				</div>
			</div>
		</div>
	);
};

export default RightSection;

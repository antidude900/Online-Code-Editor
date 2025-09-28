import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		return res.status(400).json({ message: "Please fill all the fields" });
	}

	const userExists = await User.findOne({ $or: [{ email }, { username }] });
	if (userExists) {
		return res.status(400).json({ message: "User already exists" });
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	const newUser = new User({ username, email, password: hashedPassword });

	try {
		await newUser.save();
		createToken(res, newUser._id);

		res.status(201).json({
			_id: newUser._id,
			username: newUser.username,
			email: newUser.email,
		});
	} catch (error) {
		return res
			.status(400)
			.json({ message: error?.message || "Invalid user data" });
	}
});

const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const existingUser = await User.findOne({ email });

	if (existingUser) {
		const isPasswordValid = await bcrypt.compare(
			password,
			existingUser.password
		);

		if (isPasswordValid) {
			createToken(res, existingUser._id);

			return res.status(201).json({
				_id: existingUser._id,
				username: existingUser.username,
				email: existingUser.email,
			});
		} else {
			return res.status(401).json({ message: "Incorrect Password" });
		}
	} else {
		return res.status(401).json({ message: "User not found" });
	}
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0),
	});

	res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

export { createUser, loginUser, logoutCurrentUser, getAllUsers };

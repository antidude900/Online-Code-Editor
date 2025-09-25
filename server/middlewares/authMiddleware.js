import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
	let token;

	token = req.cookies.jwt;

	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = await User.findById(decoded.userId).select("-password");

			if (!req.user) throw new Error("Not Authenticated");
			next();
		} catch (error) {
			res.status(401).json({ message: "Not Authenticated" });
		}
	} else {
		res.status(401).json({ message: "Not Authenticated" });
	}
});

export default authenticate;

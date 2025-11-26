import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
	let token;

	token = req.cookies.jwt;

	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = await User.findById(decoded.userId).select("-password");

			if (!req.user) throw new Error();
			next();
		} catch (error) {
			res.status(401).json({ message: "Not Authenticated" });
		}
	} else {
		console.log("No token found in cookies");
		res.status(401).json({ message: "Not Authenticated" });
	}
};

export default authenticate;

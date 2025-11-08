import File from "../models/File.js";

const fileMiddleware = async (req, res, next) => {
	const user = req.user;

	try {
		req.file = await File.findById(req.params.id);
		if (!req.file) {
			return res.status(404).json({ message: "File Not Found" });
		}

		if (user._id.toString() !== req.file.author.toString()) {
			return res.status(403).json({ message: "Not Authorized" });
		}
	} catch (error) {
		console.log("error", error);
		if (error.name === "CastError") {
			return res.status(404).json({ message: "File Not Found" });
		}

		return res.status(500).json({ message: "Error Occurred" });
	}

	next();
};

export default fileMiddleware;

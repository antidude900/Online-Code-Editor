import File from "../models/File.js";

export const createFile = async (req, res) => {
	console.log("inside");
	console.log(req.user);
	const user = req.user;
	try {
		const { filename, code } = req.body;
		if (!filename) {
			return res.status(400).json({ message: "Filename is required" });
		}

		const exists = await File.findOne({ author: user._id, filename });
		if (exists) {
			return res.status(400).json({ message: "File already exists" });
		}
		const file = new File({ filename, code, author: user._id });
		await file.save();
		res.status(201).json({ _id: file._id, filename: file.filename });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message });
	}
};

export const getAllFiles = async (req, res) => {
	const user = req.user;
	try {
		const files = await File.find({ author: user._id }).sort({ createdAt: 1 });
		res.json(files);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getFileById = async (req, res) => {
	const user = req.user;

	try {
		const file = await File.findById(req.params.id);
		if (!file) {
			return res.status(404).json({ message: "File Not Found" });
		}

		if (user._id.toString() !== file.author.toString()) {
			return res.status(403).json({ message: "Not Authorized" });
		}

		res.json(file);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const saveFile = async (req, res) => {
	try {
		console.log("body", req.body);
		const code = req.body;

		const file = await File.findById(req.params.id);
		if (!file) {
			return res.status(404).json({ message: "File not found" });
		}
		if (code) file.code = code;
		await file.save();
		res.json(file);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteFile = async (req, res) => {
	try {
		const file = await File.findById(req.params.id);
		if (!file) {
			return res.status(404).json({ message: "File not found" });
		}
		await file.deleteOne();
		res.json({ message: "File deleted" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const renameFile = async (req, res) => {
	try {
		const { filename } = req.body;
		if (!filename) {
			return res.status(400).json({ message: "Filename is required" });
		}
		const file = await File.findById(req.params.id);
		if (!file) {
			return res.status(404).json({ message: "File not found" });
		}
		file.filename = filename;
		await file.save();
		res.json({ _id: file._id, filename: file.filename });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

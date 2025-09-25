import express from "express";
import {
	createFile,
	getAllFiles,
	getFileById,
	saveFile,
	deleteFile,
	renameFile,
} from "../controllers/fileController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(authenticate, createFile).get(authenticate, getAllFiles);

router
	.route("/:id")
	.get(authenticate, getFileById)
	.put(authenticate, saveFile)
	.delete(authenticate, deleteFile)
	.patch(authenticate, renameFile);

export default router;

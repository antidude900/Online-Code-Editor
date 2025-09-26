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
import fileMiddleware from "../middlewares/fileMiddleware.js";

const router = express.Router();

router.route("/").post(authenticate, createFile).get(authenticate, getAllFiles);

router
	.route("/:id")
	.get(authenticate, fileMiddleware, getFileById)
	.put(authenticate, fileMiddleware, saveFile)
	.delete(authenticate, fileMiddleware, deleteFile)
	.patch(authenticate, fileMiddleware, renameFile);

export default router;

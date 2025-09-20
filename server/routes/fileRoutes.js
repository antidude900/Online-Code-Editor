import express from "express";
import {
	createFile,
	getAllFiles,
	getFileById,
	saveFile,
	deleteFile,
	renameFile,
} from "../controllers/fileController.js";

const router = express.Router();

router.route("/").post(createFile).get(getAllFiles);

router
	.route("/:id")
	.get(getFileById)
	.put(saveFile)
	.delete(deleteFile)
	.patch(renameFile);

export default router;

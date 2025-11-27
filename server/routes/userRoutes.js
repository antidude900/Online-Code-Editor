import express from "express";

import {
	createUser,
	loginUser,
	logoutUser,
	verifyUser,
} from "../controllers/userController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/verify", authenticate, verifyUser);

export default router;

import express from "express";
import axios from "axios";

const router = express.Router();
const API = axios.create({
	baseURL: "https://emkc.org/api/v2/piston",
});

export const executeCode = async (req, res) => {
	try {
		const response = await API.post("/execute", req.body);
		res.json(response.data);
	} catch (error) {
		console.log(error);
	}
};

router.post("/execute", executeCode);
export default router;

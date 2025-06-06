import express, { json } from "express";

import cors from "cors";
import dotenv from "dotenv";
import pistonRoutes from "./routes/third-party/pistonRoutes.js";
import nodemailerRoutes from "./routes/third-party/nodemailerRoutes.js";
dotenv.config();

const app = express();
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"]
	})
);

app.use(json());

app.use("/api/third-party/piston", pistonRoutes);
app.use("/api/third-party/nodemailer", nodemailerRoutes);

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import connectDB from "./config/db.js";
import { startWebSocketServer } from "./websocket/websocket.js";
import pistonRoutes from "./routes/pistonRoutes.js";
import nodemailerRoutes from "./routes/nodemailerRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);
startWebSocketServer(server);

app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/piston", pistonRoutes);
app.use("/api/nodemailer", nodemailerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(
		`WebSocket server available at ws://localhost:${PORT}/ws/execute`
	);
});
app.get("/", (_, res) => {
	res.send("API is running...");
});

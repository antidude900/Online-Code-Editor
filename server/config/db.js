import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let isConnected = false;

const connectDB = async () => {
	mongoose.set("strictQuery", true);

	if (!process.env.MONGODB_URL) {
		return console.log("Missing MONGODB URL!");
	}

	if (isConnected) {
		return;
	}

	try {
		await mongoose.connect(process.env.MONGODB_URL, {
			dbName: "OnlineCodeEditor",
		});
		isConnected = true;
		console.log("MONGODB is connected");
	} catch (error) {
		isConnected = false;
		console.log("Error connecting to MONGODB", error);
		console.log("Trying again...");
		await connectDB();
	}
};

export default connectDB;

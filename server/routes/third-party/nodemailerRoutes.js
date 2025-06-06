import express from "express";
import dotenv from "dotenv";
import { createTransport } from "nodemailer";

const router = express.Router();
dotenv.config();

const transporter = createTransport({
	service: "Gmail",
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASS,
	},
});

router.post("/send", (req, res) => {
	console.log("reached");
	const mailOptions = {
		from: process.env.EMAIL,
		to: req.body.to,
		subject: req.body.subject,
		html: req.body.message,
	};

	transporter.sendMail(mailOptions, (error) => {
		if (error) {
			console.error("Error sending email:", error);
			return res.status(500).send(error);
		}
		res.status(200).send("Email sent successfully");
	});
});
export default router;

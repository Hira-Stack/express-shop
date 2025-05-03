import nodemailer from "nodemailer";
import "dotenv/config.js";

// Create a connection to nodemailer mail server
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export function setMailOptions(destinationEmail, emailSubject, emailText) {
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: destinationEmail,
        subject: emailSubject,
        text: emailText
    };

    return mailOptions;
}

export default transporter;

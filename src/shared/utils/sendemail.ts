import nodemailer from "nodemailer";
import dns from "dns";

// 🚀 Keep this! It forces IPv4 and stops the ENETUNREACH error
dns.setDefaultResultOrder("ipv4first");

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 587,          // 🔥 Changed to 587 (Standard TLS port)
      secure: false,      // 🔥 MUST be false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // 🔥 Hostinger ke strict SSL check ko bypass karne ke liye
      }
    });

    const info = await transporter.sendMail({
      from: `"BrainMock" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email successfully sent to: ${to} | ID: ${info.messageId}`);
    return true;

  } catch (error: any) {
    console.error("❌ HOSTINGER EMAIL ERROR:", error.message);
    return false;
  }
};

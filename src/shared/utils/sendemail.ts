import nodemailer from "nodemailer";
import dns from "dns"; // 👈 YE NAYA IMPORT HAI

// 🚀 THE ULTIMATE FIX: Ye poore Node.js ko majboor karega IPv4 (purana system) use karne pe
dns.setDefaultResultOrder("ipv4first");

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Yahan se 'family: 4 as any' hata diya hai kyunki ab uski zaroorat nahi
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

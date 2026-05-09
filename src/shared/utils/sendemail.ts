import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,       // 🔥 Hostinger ke liye 465
      secure: true,    // 🔥 465 port ke liye true
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // 🚀 Force IPv4 for Railway
      family: 4, 
    } as any); // 👈 YAHAN 'as any' LAGA DIYA TAARI TYPESCRIPT ERROR NA DE

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

import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        family: 4 as any, // force IPv4
      },
    } as any);

    await transporter.verify();
    console.log("✅ SMTP connected");

    const info = await transporter.sendMail({
      from: `"BrainMock" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email successfully sent to: ${to} | ID: ${info.messageId}`);
    return true;

  } catch (error: any) {
    console.error("❌ HOSTINGER EMAIL ERROR:", error);
    return false;
  }
};
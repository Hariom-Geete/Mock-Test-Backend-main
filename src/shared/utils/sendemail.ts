import nodemailer from "nodemailer";

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
    // 🔥 YE TUJHE ASLI BIMARI BATAYEGA
    console.error("❌ HOSTINGER EMAIL ERROR:", error.message);
    
    // Hum yahan jaan-bujh kar error throw nahi kar rahe, 
    // taaki email fail hone par student create hone ka process na ruke.
    return false;
  }
};
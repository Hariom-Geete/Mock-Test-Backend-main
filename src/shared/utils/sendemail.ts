import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {

  const transporter =
    nodemailer.createTransport({
      host: "smtp.hostinger.com",

      port: 465,

      secure: true,

      auth: {
        user:
          process.env.EMAIL_USER,

        pass:
          process.env.EMAIL_PASS,
      },
    });

  await transporter.sendMail({
    from: `"BrainMock" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
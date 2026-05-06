import nodemailer
    from "nodemailer";

export const sendDemoRequest =
    async (
        name: string,
        email: string,
        institute: string,
        message: string
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

        await transporter.verify();

     

        const info =
            await transporter.sendMail({

                from:
                    `"${name} via BrainMock" <admin@brainmock.com>`,

                to:
                    "admin@brainmock.com",

                replyTo:
                    email,

                subject:
                    `New Demo Request from ${name}`,

                html: `
          <div style="
            font-family: Arial;
            padding: 20px;
          ">

            <h2>
              New Demo Request
            </h2>

            <p>
              <strong>Name:</strong>
              ${name}
            </p>

            <p>
              <strong>Email:</strong>
              ${email}
            </p>

            <p>
              <strong>Institute:</strong>
              ${institute}
            </p>

            <p>
              <strong>Message:</strong>
            </p>

            <div style="
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
            ">
              ${message}
            </div>

          </div>
        `,
            });

    };
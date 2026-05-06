import SupportTicket
    from "./support.model.js";

import User
    from "../users/user.model.js";

import nodemailer
    from "nodemailer";

export const createTicket =
    async (
        userId: string,
        category: string,
        subject: string,
        description: string
    ) => {

        const user =
            await User.findById(
                userId
            );

        if (!user) {

            throw new Error(
                "User not found"
            );
        }

        // SAVE TICKET
        const ticket =
            await SupportTicket.create({
                user: userId,
                category,
                subject,
                description,
            });

        // EMAIL TRANSPORT
        const transporter =
            nodemailer.createTransport({
                host:
                    "smtp.hostinger.com",

                port: 465,

                secure: true,

                auth: {
                    user:
                        process.env.EMAIL_USER,

                    pass:
                        process.env.EMAIL_PASS,
                },
            });

        // SEND TO SUPPORT TEAM
        const info =
            await transporter.sendMail({

                from:
                    `"BrainMock Support" <${process.env.EMAIL_USER}>`,

                to:
                    "admin@brainmock.com",

                replyTo:
                    user.email,

                subject:
                    `New Support Ticket: ${subject}`,

                html: `
      <div style="
        font-family: Arial;
        padding: 20px;
      ">

        <h2>
          New Support Ticket
        </h2>

        <p>
          <strong>Institute/User:</strong>
          ${user.name}
        </p>

        <p>
          <strong>Email:</strong>
          ${user.email}
        </p>

        <p>
          <strong>Category:</strong>
          ${category}
        </p>

        <p>
          <strong>Subject:</strong>
          ${subject}
        </p>

        <p>
          <strong>Description:</strong>
        </p>

        <div style="
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
        ">
          ${description}
        </div>

      </div>
    `,
            });


        return ticket;
    };
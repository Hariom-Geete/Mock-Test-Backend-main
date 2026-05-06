export const resetPasswordTemplate = (
  resetUrl: string
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f7fb;
          font-family: Arial, sans-serif;
        }

        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        }

        .header {
          background: #0f766e;
          padding: 28px;
          text-align: center;
        }

        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
        }

        .content {
          padding: 40px 32px;
          color: #1f2937;
          line-height: 1.7;
        }

        .content h2 {
          margin-top: 0;
          font-size: 24px;
        }

        .button-wrapper {
          text-align: center;
          margin: 35px 0;
        }

        .button {
          display: inline-block;
          padding: 14px 28px;
          background: #0f766e;
          color: white !important;
          text-decoration: none;
          border-radius: 10px;
          font-weight: bold;
          font-size: 16px;
        }

        .footer {
          padding: 24px;
          text-align: center;
          color: #6b7280;
          font-size: 13px;
          background: #f9fafb;
        }

        .warning {
          margin-top: 24px;
          font-size: 14px;
          color: #dc2626;
        }

      </style>
    </head>

    <body>
      <div class="container">

        <div class="header">
          <h1>BrainMock</h1>
        </div>

        <div class="content">
          <h2>Reset Your Password</h2>

          <p>
            We received a request to reset your password.
            Click the button below to create a new password.
          </p>

          <div class="button-wrapper">
            <a href="${resetUrl}" class="button">
              Reset Password
            </a>
          </div>

          <p>
            This link will expire in 15 minutes.
          </p>

          <p class="warning">
            If you did not request this password reset,
            you can safely ignore this email.
          </p>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} BrainMock. All rights reserved.
        </div>

      </div>
    </body>
    </html>
  `;
};
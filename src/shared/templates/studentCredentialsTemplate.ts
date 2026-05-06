export const studentCredentialsTemplate =
(
  name: string,

  email: string,

  tempPassword: string
) => {

  return `

    <div style="
      font-family: Arial, sans-serif;
      padding: 24px;
      background: #f8fafc;
    ">

      <div style="
        max-width: 600px;
        margin: auto;
        background: white;
        border-radius: 16px;
        padding: 32px;
        border: 1px solid #e2e8f0;
      ">

        <h1 style="
          color: #0f172a;
          margin-bottom: 12px;
        ">
          Welcome to Braimock 🎓
        </h1>

        <p style="
          color: #475569;
          font-size: 15px;
          line-height: 1.7;
        ">

          Hello ${name},

          <br /><br />

          Your student account has been created successfully.

          <br /><br />

          <strong>Login Credentials:</strong>

          <br /><br />

          Email:
          <strong>${email}</strong>

          <br /><br />

          Temporary Password:
          <strong>${tempPassword}</strong>

          <br /><br />

          Please login and change your password immediately for security.

        </p>

        <a
          href="http://localhost:5173/student-login"
          style="
            display: inline-block;
            margin-top: 24px;
            padding: 12px 24px;
            background: #14b8a6;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
          "
        >
          Login Now
        </a>

        <p style="
          margin-top: 32px;
          color: #94a3b8;
          font-size: 13px;
        ">

          Brainmock Platform
        </p>
      </div>
    </div>
  `;
};
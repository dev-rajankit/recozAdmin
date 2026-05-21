import nodemailer from 'nodemailer';

const host = process.env.EMAIL_SERVER_HOST;
const port = Number(process.env.EMAIL_SERVER_PORT);
const user = process.env.EMAIL_SERVER_USER;
const pass = process.env.EMAIL_SERVER_PASSWORD;
const from = process.env.EMAIL_FROM;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user,
    pass,
  },
});


export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  const mailOptions = {
    from,
    to: email,
    subject: 'Reset Your Password for Recoz Library Admin',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>You are receiving this email because a password reset request was made for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #1976D2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr/>
        <p>Thanks,</p>
        <p>The Recoz Library Admin Team</p>
      </div>
    `,
  };

  // The actual sending is commented out.
  // To enable, set up your email provider credentials in the .env file.
  // await transporter.sendMail(mailOptions);

  console.log(`Password reset link for ${email}: ${resetLink}`);
};

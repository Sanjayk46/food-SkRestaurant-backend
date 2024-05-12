const nodemailer = require('nodemailer');
const passwordReset = function(user){

const generateOTP = () => {
    const characters = "0123456789";
    return Array.from(
      { length: 6 },
      () => characters[Math.floor(Math.random() * characters.length)]
    ).join("");
  };

  const OTP = generateOTP();
  user.resetPasswordOtp = OTP;
  user.resetPasswordExpires = Date.now() + 3600000;
  user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAILER,
      pass: process.env.USER_PASS,
    },
  });
  //${user.firstName} ${user.lastName},
  const mailOptions = {
    from: "narutohinata101999@gmail.com",
    to: user.email,
    subject: "Password Reset",
    html: `
      <p>Dear User</p>
      <p>We received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></p>
      <p>Please click the following link to reset your password:</p>
      <a href="http://localhost:3000/reset">Reset Password</a>
      <p>If you did not make this request, please ignore this email.</p>
      <p>Thank you,</p>
      <p>From Validation</p>
    `,
  };
}
module.exports = passwordReset;
const express = require('express');
const router = express.Router();
const {userModel} = require('../database/userModel'); 
const authMiddleware = require('../middleware/auth');
const {admin} = require('../middleware/admin');
const jwt  = require ('jsonwebtoken');
const handler =require ('express-async-handler');
const nodemailer = require('nodemailer');
const bcrypt =require ('bcryptjs');
const PASSWORD_HASH_SALT_ROUNDS = 10;
const BAD_REQUEST = 400;
router.post(
  '/login',
  handler(async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.send(generateTokenResponse(user));
      return;
    }

    res.status(BAD_REQUEST).send('Username is invalid');
  })
);

router.post(
  '/register',
  handler(async (req, res) => {
    const { firstName,lastName, email, password, address } = req.body;

    const user = await userModel.findOne({ email });

    if (user) {
      res.status(BAD_REQUEST).send('User already exists, please login!');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      PASSWORD_HASH_SALT_ROUNDS
    );

    const newUser = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
    };

    const result = await userModel.create(newUser);
    res.send(generateTokenResponse(result));
  })
);

router.put(
  '/updateProfile',
  authMiddleware,
  handler(async (req, res) => {
    const { firstName, lastName,address } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, address },
      { new: true }
    );

    res.send(generateTokenResponse(user));
  })
);
router.post('/forgotPassword',handler(async (req, res)=>{
  const { email } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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
    await user.save();

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
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>We received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></p>
        <p>Please click the following link to reset your password:</p>
        <a href="https://skrestaurant-food.netlify.app/reset-password">Reset Password</a>
        <p>If you did not make this request, please ignore this email.</p>
        <p>Thank you,</p>
        <p>From Validation</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}));

router.post('/resetPassword',handler(async(req,res)=>{
  try {
    const { OTP, password } = req.body;

    const user = await userModel.findOne({
      resetPasswordOtp: OTP,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const message = user ? "OTP has expired" : "Invalid OTP";
      return res.status(404).json({ message });
    }
    const expirationTime = Date.now() + (5 * 60 * 1000); // 5 minutes in milliseconds
      
    // Update the user's resetPasswordExpires field with the new expiration time
    user.resetPasswordExpires = expirationTime;
    const hashedPassword = await bcrypt.hash(
      password,
      PASSWORD_HASH_SALT_ROUNDS
    );
    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}));
router.put(
  '/changePassword',
  authMiddleware,
  handler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!user) {
      res.status(BAD_REQUEST).send('Change Password Failed!');
      return;
    }

    const equal = await bcrypt.compare(currentPassword, user.password);

    if (!equal) {
      res.status(BAD_REQUEST).send('Current Password Is Not Correct!');
      return;
    }

    user.password = await bcrypt.hash(newPassword, PASSWORD_HASH_SALT_ROUNDS);
    await user.save();

    res.send();
  })
);

router.get(
  '/getall/:searchTerm?',
  admin,
  handler(async (req, res) => {
    const { searchTerm } = req.params;

    const filter = searchTerm
      ? { name: { $regex: new RegExp(searchTerm, 'i') } }
      : {};

    const users = await userModel.find(filter, { password: 0 });
    res.send(users);
  })
);

router.put(
  '/toggleBlock/:userId',
  admin,
  handler(async (req, res) => {
    const { userId } = req.params;

    if (userId === req.user.id) {
      res.status(BAD_REQUEST).send("Can't block yourself!");
      return;
    }

    const user = await userModel.findById(userId);
    user.isBlocked = !user.isBlocked;
    user.save();

    res.send(user.isBlocked);
  })
);

router.get(
  '/getById/:userId',
  admin,
  handler(async (req, res) => {
    const { userId } = req.params;
    const user = await userModel.findById(userId, { password: 0 });
    res.send(user);
  })
);

router.put('/update',
admin,
handler(async (req, res) => {
    const { id, firstName, lastName, email, address, isAdmin } = req.body;
    await userModel.findByIdAndUpdate(id, {
      firstName,
      lastName,
      email,
      address,
      isAdmin,
    });

    res.send();
  })
);

const generateTokenResponse = user => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30min',
    }
  );

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    address: user.address,
    isAdmin: user.isAdmin,
    token,
  };
};

module.exports = router;

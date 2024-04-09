const express = require('express');
const router = express.Router();
const {userModel} = require('../database/userModel'); 
const authMiddleware = require('../middleware/auth');
const {admin} = require('../middleware/admin');
const jwt  = require ('jsonwebtoken');
const handler =require ('express-async-handler');
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
    const { name, email, password, address } = req.body;

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
      name,
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
    const { name, address } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { name, address },
      { new: true }
    );

    res.send(generateTokenResponse(user));
  })
);

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
    const { id, name, email, address, isAdmin } = req.body;
    await userModel.findByIdAndUpdate(id, {
      name,
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
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token,
  };
};

module.exports = router;
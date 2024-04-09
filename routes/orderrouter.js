const express = require('express');
const authMiddleware = require('../middleware/auth');
const handler =require ('express-async-handler');
const {orderModel} = require('../database/orderModel');
 const {userModel} = require('../database/userModel');
const OrderStatus = require('../constants/orderstatus');
const sendEmailReceipt = require('../helper/mailhelper');
const BAD_REQUEST= 400;
const UNAUTHORIZED = 401;
const router = express.Router();
router.use(authMiddleware);

router.post(
  '/create',
  handler(async (req, res) => {
    const order = req.body;
    if (order.items.length <= 0) res.status(BAD_REQUEST).send('Cart Is Empty!');
    // console.log(OrderStatus);
    await orderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });

    const newOrder = new orderModel({ ...order, user: req.user.id });
    // console.log(newOrder);
    await newOrder.save();
    res.send(newOrder);
  })
);
router.put(
  '/pay',
  handler(async (req, res) => {
    const { paymentId } = req.body;
    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
      res.status(BAD_REQUEST).send('Order Not Found!');
      return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    sendEmailReceipt(order);

    res.send(order._id);
  })
);

router.get(
  '/track/:orderId',
  handler(async (req, res) => {
    const { orderId } = req.params;
    const user = await userModel.findById(req.user.id);
    //console.log(user); 
    const filter = {
      _id: orderId,
    };
    // console.log(filter);
    if (!user.isAdmin) {
      filter.user = user._id;
    }

    const order = await orderModel.findOne(filter);
    console.log(order);
    if (!order){ return res.send(UNAUTHORIZED)};

    return res.send(order);
  })
);

router.get(
  '/newOrderForCurrentUser',
  handler(async (req, res) => {
    const order = await getNewOrderForCurrentUser(req);
    if (order) res.send(order);
    else res.status(BAD_REQUEST).send();
  })
);

router.get('/allstatus',(req, res) => {
  const allStatus = Object.values(OrderStatus);
  res.send(allStatus);
});

router.get(
  '/:status?',
  handler(async (req, res) => {
    const status = req.params.status;
    const user = await userModel.findById(req.user.id);
    const filter = {};

    if (!user.isAdmin) filter.user = user._id;
    if (status) filter.status = status;

    const orders = await orderModel.find(filter).sort('-createdAt');
    res.send(orders);
  })
);

const getNewOrderForCurrentUser = async (req) => {
  try {
    const order = await orderModel.findOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    }).populate('user');
    console.log(order);
    return order;

  } catch (error) {
    console.error('Error fetching new order for current user:', error);
    return null;
  }
};


  module.exports = router;

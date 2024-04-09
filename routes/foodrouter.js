const express = require('express');
const router = express.Router();
const { foodModel } =require('../database/foodModel');
const handler =require ('express-async-handler');
const {admin} = require('../middleware/admin');


// router.get('/',handler(async(req,res)=>{
//   res.send(samplefoods)
// }));
// router.get('/tags',handler(async(req,res)=>{
//   res.send(sampletags)
// }));
// router.get('/search/:searchTerm',handler(async(req,res)=>{
//   const{searchTerm}=req.params;
//   const foods = samplefoods.filter(item=>
//       item.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()));
//   res.status(200).send(foods);
// }));
// router.get('/tag/:tag',handler(async(req,res)=>{
//   const{tag}=req.params;
//   const foods = samplefoods.filter(item=>
//     item.tags?.includes(tag));
//   res.status(200).send(foods);
// }));
// router.get('/:foodId',handler(async(req,res)=>{
//  const {foodId} = req.params;
//  const food = samplefoods.find(item =>item.id === foodId);
//  res.send(food);
//}));
router.get(
  '/',
  handler(async (req, res) => {
    try {
      const foods = await foodModel.find({});
    res.send(foods);
    } catch (error) {
      res.status(500).send({
        message:"Internal Server Error",
        error:error.message
    })
    }
  })
);

router.post(
  '/',
  admin,
  handler(async (req, res) => {
    const { name, price, tags, favorite, imageUrl, origins, cookTime } =
      req.body;

    const food = new foodModel({
      name,
      price,
      tags: tags.split ? tags.split(',') : tags,
      favorite,
      imageUrl,
      origins: origins.split ? origins.split(',') : origins,
      cookTime,
    });

    await food.save();

    res.send(food);
  })
);

router.put(
  '/',
  admin,
  handler(async (req, res) => {
    const { id, name, price, tags, favorite, imageUrl, origins, cookTime } =
      req.body;

    await foodModel.updateOne(
      { _id: id },
      {
        name,
        price,
        tags: tags.split ? tags.split(',') : tags,
        favorite,
        imageUrl,
        origins: origins.split ? origins.split(',') : origins,
        cookTime,
      }
    );

    res.send();
  })
);

router.delete(
  '/:foodId',
    admin,
    handler(async (req, res) => {
    const { foodId } = req.params;
    await foodModel.deleteOne({ _id: foodId });
    res.send();
  })
);

router.get(
  '/tags',
  handler(async (req, res) => {
    const tags = await foodModel.aggregate([
      {
        $unwind: '$tags',
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: '$count',
        },
      },
    ]).sort({ count: -1 });

    const all = {
      name: 'All',
      count: await foodModel.countDocuments(),
    };

    tags.unshift(all);

    res.send(tags);
  })
);

router.get(
  '/search/:searchTerm',
  handler(async (req, res) => {
    const { searchTerm } = req.params;
    const searchRegex = new RegExp(searchTerm, 'i');

    const foods = await foodModel.find({ name: { $regex: searchRegex } });
    res.send(foods);
  })
);

router.get(
  '/tag/:tag',
  handler(async (req, res) => {
    const { tag } = req.params;
    const foods = await foodModel.find({ tags: tag });
    res.send(foods);
  })
);

router.get(
  '/:foodId',
  handler(async (req, res) => {
    const { foodId } = req.params;
    const food = await foodModel.findById(foodId);
    res.send(food);
  })
);

router.post(
  '/',
  admin,
  handler(async (req,res)=>{
    const { name, price, tags, favorite, origins, cookTime } = req.body;
    const food = new foodModel({
      name,
      price,
      tags: tags.split(','), // Assuming tags is a comma-separated string
      favorite,
      imageUrl, // Assign the uploaded imageUrl or undefined if no file is uploaded
      origins: origins.split(','), // Assuming origins is a comma-separated string
      cookTime,
    });

    try {
      // Save the food document to the database
      await food.save();
      res.send(food);
    } catch (error) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ errors });
      }
      console.error('Error saving food:', error);
      res.status(500).send('Error saving food');
    }
  })
);

module.exports = router;
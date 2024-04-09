const mongoose = require("mongoose");
const {userModel} = require("./userModel");
//const {hotelModel}= require("./hotelModel");
const { sampleusers } = require('../data');
//const { samplehotel } = require('../data');
const {foodModel} = require("./foodModel");
const {samplefoods} = require('../data');
const dbConnection = async ()=>{
    try {
        await mongoose.connect("mongodb+srv://sanjayks8046:Iahdd45uAymNkIEM@zendb.kv2hnw1.mongodb.net/");
        
        await seedFoods();
        await seedusers();
        //await seedhotels();
        console.log("DB Connected");
    } catch (error) {
        console.log(error.message," error in connecting db");
    }
}

async function seedusers() {
    const usersCount = await userModel.countDocuments();
    console.log(usersCount);
  if (usersCount > 0) {
    console.log('users seed is already done!');
    return;
  }
  for (let user of sampleusers) {
    user.password = await bcrypt.hash(user.password, PASSWORD_HASH_SALT_ROUNDS);
    await userModel.create(user);
  }
  
  console.log('Users seed is done!');
}


async function seedFoods() {
  const foodsCount = await foodModel.countDocuments();
  console.log(foodsCount);
  if (foodsCount > 0) {
    console.log('foods seed is already done!');
    return;
  }

  for (const food of samplefoods) {
    food.imageUrl = `/foods/${food.imageUrl}`;
    await foodModel.create(food)
  }

  console.log('foods seed is done!');
}


module.exports = { dbConnection};
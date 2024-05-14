const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderStatus = require('../constants/orderstatus');
const {foodModel} =require('./foodModel');

const LatLngSchema = new Schema(
    {
  lat:{type:String , required:true},
  lng:{type:String , required:true}  

},{
    _id: false,
}
);

const OrderItemSchema = new Schema({
    food: { type:foodModel.schema, required:true},
    price:{type:Number, required:true},
    quantity:{type:Number, required:true}
},{
    _id:false,
});

OrderItemSchema.pre('validate', function(next){
    this.price = this.food.price * this.quantity;
    next();
});

const orderSchema = new Schema(
    {   
        firstName:{ type: String,required: true },
        lastName: { type: String ,required: true},
        address: { type: String, required: true },
        addressLatLng: { type: LatLngSchema },
        paymentId: { type: String },
        totalPrice: { type: Number, required: true },
        items: { type: [OrderItemSchema], required: true },
        status: { type: String, default: OrderStatus.NEW },
        user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
      },
      {
        timestamps: true,
        toJSON: {
          virtuals: true,
        },
        toObject: {
          virtuals: true,
        },
    }    
);
const orderModel = mongoose.model('order', orderSchema);
module.exports = {orderModel}

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        address: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        resetPasswordOtp:{type:Number},
        resetPasswordExpires:{type:Date},
        isBlocked: { type: Boolean, default: false },
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
)

const userModel = mongoose.model("user", userSchema);
module.exports = {userModel};
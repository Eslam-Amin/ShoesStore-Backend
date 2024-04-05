const mongoose = require("mongoose");

//2) create user schema

const userOTPVerificationSchema = new mongoose.Schema({
   userId: {
      type: String
   },
   otp: {
      type: String
   },
   createdAt: {
      type: Date
   },
   expiresAt: {
      type: Date
   }
});


//3) create model

const userVerificationOTP = mongoose.model("userOTPVerification", userOTPVerificationSchema);
module.exports = userVerificationOTP
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
        min: 3,
        max: 25,
    },
    lastName: {
        type: String,
        require: true,
        min: 3,
        max: 25,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
        min: 6
    },
    verified: {
        type: Boolean,
        required: true
    }

}, { timestamps: true });



userSchema.methods.genAuthToken = function () {
    const JWT_SEC_VAR = (process.env.JWT_SEC_VAR);
    const token = jwt.sign({ userId: this._id }, JWT_SEC_VAR);
    return token;
}

module.exports = mongoose.model("User", userSchema);
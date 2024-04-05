const router = require("express").Router();
const User = require("../models/User");
const OTPVerification = require("../models/userOTPVerification");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");



let nodemailer = nodeMailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
        user: "ea.eslamamin@outlook.com",
        pass: "eca just 1"
    }
})



//Register New User
router.post("/register", async (req, res) => {
    try {

        //Checks if email registered Before
        const isUserExisted = await User.findOne({ email: req.body.email });
        if (isUserExisted)
            return res.status(400).json({
                status: "Failed",
                message: "Email Already Registered"
            });

        //Hashing Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //create new User 
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashedPassword,
            email: req.body.email,
            verified: false
        })


        //save user and reture respond
        const user = await newUser.save();

        const token = user.genAuthToken();
        res.header("x-auth-token", token)

        const { password, createdAt, updatedAt, ...otherInfo } = user._doc;
        sendOTPVerification({ userId: user._id, email: req.body.email }, res);
        res.status(200).json({ status: "200", user: otherInfo });


    } catch (err) {
        res.status(500).json(err.message)
    }
})


//login Router
router.post("/login", async (req, res) => {
    try {
        //get user data from DB based on his email
        const user = await User.findOne({ email: req.body.email });

        const errMsg = "Either mail or password is INVALID";

        //return errMsg if user not Found
        !user && res.status(404).json(errMsg);

        //check on password if user is found
        const validPassword = await bcrypt.compare(req.body.password, user.password);

        //return errMsg if password is wrong
        !validPassword && res.status(400).json(errMsg);

        const token = user.genAuthToken();
        res.header("x-auth-token", token)

        //if all success return user.

        const { password, createdAt, updatedAt, ...otherInfo } = user._doc;
        res.status(200).json({ status: "200", user: otherInfo });

    } catch (err) {
        res.status(500).json(err.message);
    }
});


const sendOTPVerification = async ({ userId, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const mailOptions = {
            from: "ea.eslamamin@outlook.com",
            to: email,
            subject: "Verify your email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the register<br><b>This EXPIRES in one HOUR!!</b>.</p>`
        };

        //hash the otp 
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = new OTPVerification({
            userId,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000
        })
        await newOTPVerification.save();
        await nodemailer.sendMail(mailOptions);
        res.json({
            status: "Pending",
            message: "Verification otp mail sent",
            data: {
                userId,
                email,
            }
        })
    } catch (err) {
        res.json({
            status: "Failed",
            message: err.message
        });
    }

}
router.post("/verifyOTP", async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            throw Error("Empty OTP Details are not allowed");
        }
        else {
            let userVerfication = await OTPVerification.find({
                userId
            });
            if (userVerfication.length <= 0) {
                //no record found
                throw new Error("Account Doesn't Exist or hass been verified already, please Sign up or login")
            }
            else {
                const { expiresAt } = userVerfication[0].expiresAt;
                const hashedOTP = userVerfication[0].otp;
                if (expiresAt < Date.now()) {
                    await OTPVerification.deleteMany({
                        userId
                    })
                    throw new Error("OTP Has Expired, Please Request Again")
                }
                else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP);
                    if (!validOTP) {
                        throw new Error("Invalid OTP, check Your inbox");
                    }
                    else {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await OTPVerification.deleteMany({ userId });

                        res.status(200).json({
                            status: "Verified",
                            message: `Email has beed Verified`
                        })
                    }
                }
            }
        }
    }
    catch (err) {
        res.status(200).json({
            status: "Failed",
            message: err.message
        })
    }
});



const verifyOTP = async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            throw Error("Empty OTP Details are not allowed");
        }
        else {
            let userVerfication = await OTPVerification.find({
                userId
            });
            if (userVerfication.length <= 0) {
                //no record found
                throw new Error("Account Doesn't Exist or hass been verified already, please Sign up or login")
            }
            else {
                const { expiresAt } = userVerfication[0].expiresAt;
                const hashedOTP = userVerfication[0].otp;
                if (expiresAt < Date.now()) {
                    await OTPVerification.deleteMany({
                        userId
                    })
                    throw new Error("OTP Has Expired, Please Request Again")
                }
                else {
                    const validOTP = await bcrypt.compare(otp,);
                    if (!validOTP) {
                        throw new Error("Invalid OTP, check Your inbox");
                    }
                    else {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await OTPVerification.deleteMany({ userId });

                        res.status(200).json({
                            status: "Verified",
                            message: `Email has beed Verified`
                        })
                    }
                }
            }
        }
    }
    catch (err) {
        res.status(200).json({
            status: "Failed",
            message: err.message
        })
    }
}




module.exports = router;
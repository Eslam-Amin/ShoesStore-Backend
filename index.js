const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require('morgan');

const authRouter = require("./routes/auth");
//const userRouter = require("./routes/users");


const app = express();
dotenv.config();

app.use(cors());

mongoose.connect(process.env.MONGO_URL, {})
    .then(
        () => console.log("connected to MongoDB"),
        (err) => console.log(err))


//middlerware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"))

//rotuers
app.use("/api/auth", authRouter);


app.listen(8000, () => {
    console.log("backend server is running")
})



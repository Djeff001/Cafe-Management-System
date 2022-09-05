const express = require("express");
const userRoute = require("./routes/user");
var cors = require("cors");
require("./connection");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user", userRoute);

app.listen(process.env.PORT);

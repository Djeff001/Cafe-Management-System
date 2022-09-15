const express = require("express");
const userRoute = require("./routes/user");
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/product");
var cors = require("cors");
require("./connection");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user", userRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);

app.listen(process.env.PORT);

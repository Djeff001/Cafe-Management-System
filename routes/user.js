const express = require("express");
const connection = require("../connection");
const jwt = require("jsonwebtoken"); //Using AES encryption
const nodemailer = require("nodemailer");
const { encrypt, decrypt } = require("../utils/hashPassword");
const router = express.Router();

router.post("/signup", (req, res) => {
  let user = req.body;
  query = "select * from user where email=?";
  connection.query(query, [user.email], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length > 0) return res.status(400).json("Email Already Exist!");
    //const hash = encrypt(user.password);
    hash = user.password;
    const query =
      "insert into user(name, contactNumber, email, password, status, role) values(?, ?, ?,?, 'false', 'user')";
    connection.query(
      query,
      [user.name, user.contactNumber, user.email, hash],
      (err, results) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Successfully Registered!");
      }
    );
  });
});

router.post("/login", (req, res) => {
  let user = req.body;
  query = "select email, password, role, status from user where email=?";
  connection.query(query, [user.email], async (err, results) => {
    if (err) return res.status(500).json(err);
    const correctPassword = user.password == results[0].password;
    if (results.length <= 0 || !correctPassword)
      return res.status(401).json("Incorrect Username or Password!");
    if (results[0].status === "false")
      return res.status(401).json("Wait for Admin Approval!");
    const response = { email: results[0].email, role: results[0].role };
    const token = jwt.sign(response, process.env.ACCESS_TOKEN, {
      expiresIn: "8h",
    });
    //res.cookie("jwt", token, {
    //  httpOnly: true,
    //  maxAge: 8 * 60 * 60 * 1000,
    //});
    return res.status(200).json({ token: token });
  });
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASSWORD, // generated ethereal password
  },
});

router.post("/forgotPassword", (req, res) => {
  let user = req.body;
  query = "select email, password from user where email=?";
  connection.query(query, [user.email], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length <= 0) return res.status(401).json("Email Not Found!!");

    var mailOptions = await transporter.sendMail({
      from: process.env.EMAIL, // sender address
      to: results[0].email, // list of receivers
      subject: "Password by Cafe Management System ✔", // Subject line
      text: "Hello world?", // plain text body
      html:
        "<p><b>Your Login details for Cafe Management System</b><br/><b>Email: </b>" +
        results[0].email +
        "<br/><b>Password: </b>" +
        results[0].password +
        "<br/><a href='http://localhost:4200/'>Click here to login</a></p>", // html body
    });
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log(error);
      else console.log("Email sent: " + info.response);
    });
    return res
      .status(200)
      .json({ message: "Password send successfully to your email!" });
  });
});

module.exports = router;

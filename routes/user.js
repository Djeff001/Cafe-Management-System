const express = require("express");
const connection = require("../connection");
const jwt = require("jsonwebtoken"); //Using AES encryption
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.SECRET_KEY);
const nodemailer = require("nodemailer");
const { checkRole } = require("../services/checkRole");
const { authentificateToken } = require("../services/authentification");
//const { encrypt, decrypt } = require("../utils/hashPassword");
const router = express.Router();

router.post("/signup", (req, res) => {
  let user = req.body;
  query = "select * from user where email=?";
  connection.query(query, [user.email], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length > 0) return res.status(400).json("Email Already Exist!");
    //const hash = encrypt(user.password);
    hash = cryptr.encrypt(user.password);
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
    if (
      results.length <= 0 ||
      user.password != cryptr.decrypt(results[0].password)
    )
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
    req.headers["Authorization"] = token;
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
        cryptr.decrypt(results[0].password) +
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

router.get("/get", authentificateToken, checkRole, (req, res) => {
  query =
    "select id,name,email, contactNumber,status from user where role='user'";
  connection.query(query, async (err, results) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(results);
  });
});

router.patch("/update", authentificateToken, checkRole, (req, res) => {
  let user = req.body;
  query = "update user set status=? where id=?";
  connection.query(query, [user.status, user.id], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.affectedRows == 0)
      return res.status(400).json("User id does not exist!");
    return res.status(200).json({ message: "User updated successfully!" });
  });
});

router.get("/checkToken", authentificateToken, (req, res) => {
  return res.status(200).json({ message: true });
});

router.post("/changePassword", authentificateToken, (req, res) => {
  let user = req.body;
  let email = res.locals.email;
  query = "select * from user where email=?";
  connection.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length <= 0)
      return res
        .status(400)
        .json("Something went wrong. Please try again later!");
    if (user.oldPassword != cryptr.decrypt(results[0].password))
      return res.status(400).json("Incorrect Old Password!");
    query = "update user set password=? where email=?";
    connection.query(
      query,
      [cryptr.encrypt(user.newPassword), email],
      async (error, results) => {
        if (error) return res.status(500).json(err);
        return res
          .status(200)
          .json({ message: "Password Updated Successfully!" });
      }
    );
  });
});

module.exports = router;

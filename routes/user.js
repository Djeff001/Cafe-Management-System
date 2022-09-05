const express = require("express");
const connection = require("../connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/signup", (req, res) => {
  let user = req.body;
  query = "select * from user where email=?";
  connection.query(query, [user.email], async (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      if (results.length <= 0) {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(user.password, salt);
        const query =
          "insert into user(name, contactNumber, email, password, status, role) values(?, ?, ?,?, 'false', 'user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, hash],
          (err, results) => {
            if (err) {
              return res.status(500).json(err);
            } else {
              return res.status(200).json("Successfully Registered!");
            }
          }
        );
      } else {
        return res.status(400).json("Email Already Exist!");
      }
    }
  });
});

router.post("/login", (req, res) => {
  let user = req.body;
  query = "select email, password, role, status from user where email=?";
  connection.query(query, [user.email], async (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      const correctPassword = await bcrypt.compare(
        user.password,
        results[0].password
      );
      if (results.length <= 0 || !correctPassword) {
        res.status(401).json("Incorrect Username or Password!");
      } else if (results[0].status === "false") {
        res.status(401).json("Wait for Admin Approval!");
      } else {
        const response = { email: results[0].email, role: results[0].role };
        const token = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });

        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 8 * 60 * 60 * 1000,
        });
        res.status(200).json({ token: token });
      }
    }
  });
});

module.exports = router;

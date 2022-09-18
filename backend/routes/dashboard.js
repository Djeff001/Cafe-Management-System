const express = require("express");
const connection = require("../connection");
const { authentificateToken } = require("../services/authentification");
const router = express.Router();

router.get("/details", authentificateToken, (req, res) => {
  var categoryCount;
  var productCount;
  var billCount;
  var query = "select count(id) as categoryCount from category";
  connection.query(query, async (err, results) => {
    if (err) return res.status(500).json(err);
    categoryCount = results[0].categoryCount;
  });

  var query = "select count(id) as productCount from product";
  connection.query(query, async (err, results) => {
    if (err) return res.status(500).json(err);
    productCount = results[0].productCount;
  });

  var query = "select count(id) as billCount from bill";
  connection.query(query, async (err, results) => {
    if (err) return res.status(500).json(err);
    billCount = results[0].billCount;
    return res.status(200).json({
      categoryCount: categoryCount,
      productCount: productCount,
      billCount: billCount,
    });
  });
});

module.exports = router;

const express = require("express");
const connection = require("../connection");
const { checkRole } = require("../services/checkRole");
const { authentificateToken } = require("../services/authentification");
const router = express.Router();

router.post("/add", authentificateToken, checkRole, (req, res) => {
  let category = req.body;
  const query = "insert into category(name) values(?)";
  connection.query(query, [category.name], (err, results) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Category Added Successfully!" });
  });
});

router.get("/get", authentificateToken, (req, res) => {
  query = "select * from category";
  connection.query(query, async (err, results) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(results);
  });
});

router.patch("/update", authentificateToken, checkRole, (req, res) => {
  let category = req.body;
  query = "update category set name=? where id=?";
  connection.query(
    query,
    [category.name, category.id],
    async (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.affectedRows == 0)
        return res.status(400).json("Category id does not exist!");
      return res
        .status(200)
        .json({ message: "Category Updated Successfully!" });
    }
  );
});

module.exports = router;

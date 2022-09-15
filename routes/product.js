const express = require("express");
const connection = require("../connection");
const { checkRole } = require("../services/checkRole");
const { authentificateToken } = require("../services/authentification");
const router = express.Router();

router.post("/add", authentificateToken, checkRole, (req, res) => {
  let product = req.body;
  const query =
    "insert into product(name,categoryId, description,price,status) values(?,?,?,?,?)";
  connection.query(
    query,
    [
      product.name,
      product.categoryId,
      product.description,
      product.price,
      product.status,
    ],
    (err, results) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Product Added Successfully!" });
    }
  );
});

router.get("/get", authentificateToken, (req, res) => {
  query =
    "select p.id,p.name,p.description,p.price,p.status,c.id as categoryId, c.name as categoryName from product p inner join category c on p.categoryId=c.id";
  connection.query(query, async (err, results) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(results);
  });
});

router.get("/getByCategory/:id", authentificateToken, (req, res) => {
  let categoryId = req.params.id;
  query = "select id,name,description,price from product where categoryId=?";
  connection.query(query, [categoryId], async (err, results) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(results);
  });
});

router.patch("/update", authentificateToken, checkRole, (req, res) => {
  let product = req.body;
  query =
    "update product set name=?, categoryId=?, description=?,price=? where id=?";
  connection.query(
    query,
    [
      product.name,
      product.categoryId,
      product.description,
      product.price,
      product.id,
    ],
    async (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.affectedRows == 0)
        return res.status(400).json("Product id does not exist!");
      return res.status(200).json({ message: "Product Updated Successfully!" });
    }
  );
});

router.delete("/delete/:id", authentificateToken, checkRole, (req, res) => {
  let id = req.params.id;
  query = "delete from product where id=?";
  connection.query(query, [id], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.affectedRows == 0)
      return res.status(400).json("Product id does not found!");
    return res.status(200).json({ message: "Product Deleted Successfully!" });
  });
});

router.patch("/updateStatus", authentificateToken, checkRole, (req, res) => {
  let product = req.body;
  query = "update product set status=? where id=?";
  connection.query(
    query,
    [product.status, product.id],
    async (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.affectedRows == 0)
        return res.status(404).json("Product id does not found!");
      return res
        .status(200)
        .json({ message: "Product Status Updated Successfully!" });
    }
  );
});

module.exports = router;

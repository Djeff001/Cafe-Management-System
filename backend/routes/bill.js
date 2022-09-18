const express = require("express");
const connection = require("../connection");
const { authentificateToken } = require("../services/authentification");
const router = express.Router();
let ejs = require("ejs");
let pdf = require("html-pdf");
let fs = require("fs");
let path = require("path");
let uuid = require("uuid");

router.post("/generateReport", authentificateToken, (req, res) => {
  const generatedUuid = uuid.v1();
  const orderDetails = req.body;
  var productDetailsReport = JSON.parse(orderDetails.productDetails);
  const query =
    "insert into bill(name,uuid,email,contactNumber,paymentMethod,total,productDetails,createdBy) values(?,?,?,?,?,?,?,?)";
  connection.query(
    query,
    [
      orderDetails.name,
      generatedUuid,
      orderDetails.email,
      orderDetails.contactNumber,
      orderDetails.paymentMethod,
      orderDetails.totalAmount,
      orderDetails.productDetails,
      res.locals.email,
    ],
    (err, results) => {
      if (err) return res.status(500).json(err);
      ejs.renderFile(
        path.join(__dirname, "", "report.ejs"),
        {
          name: orderDetails.name,
          email: orderDetails.email,
          contactNumber: orderDetails.contactNumber,
          paymentMethod: orderDetails.paymentMethod,
          productDetails: productDetailsReport,
          totalAmount: orderDetails.totalAmount,
        },
        (error, data) => {
          if (error) return res.status(500).json(error);
          pdf
            .create(data, {
              childProcessOptions: {
                env: { OPENSSL_CONF: "/dev/null" },
              },
            })
            .toFile(
              "./generated_pdf/" + generatedUuid + ".pdf",
              (err, results) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json(err);
                }
                return res.status(200).json({ uuid: generatedUuid });
              }
            );
        }
      );
    }
  );
});

router.post("/getPdf", authentificateToken, (req, res) => {
  const orderDetails = req.body;
  const pdfPath = "./generated_pdf/" + orderDetails.uuid + ".pdf";
  if (fs.existsSync(pdfPath)) {
    res.contentType("application/pdf");
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    var productDetailsReport = JSON.parse(orderDetails.productDetails);
    ejs.renderFile(
      path.join(__dirname, "", "report.ejs"),
      {
        productDetails: productDetailsReport,
        name: orderDetails.name,
        email: orderDetails.email,
        contactNumber: orderDetails.contactNumber,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: orderDetails.totalAmount,
      },
      (err, results) => {
        if (err) return res.status(500).json(err);
        pdf
          .create(results)
          .toFile(
            "./generated_pdf/" + orderDetails.uuid + ".pdf",
            (err, data) => {
              if (err) {
                console.log(err);
                return res.status(500).json(err);
              }
              res.contentType("application/pdf");
              fs.createReadStream(pdfPath).pipe(res);
            }
          );
      }
    );
  }
});

router.get("/getBills", authentificateToken, (req, res) => {
  query = "select * from bill order by id desc";
  connection.query(query, async (err, results) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(results);
  });
});

router.delete("/delete/:id", authentificateToken, (req, res) => {
  let id = req.params.id;
  query = "delete from bill where id=?";
  connection.query(query, [id], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.affectedRows == 0)
      return res.status(400).json({ message: "Bill id does not found!" });
    return res.status(200).json({ message: "Bill Deleted Successfully!" });
  });
});

module.exports = router;

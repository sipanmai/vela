const express = require("express");
var router = express.Router();
const Orders = require("../model/order");
const Products = require('../model/product');
const jwt_decode = require('../middleware/jwt_decode');

//แสดง orders ทุกรายการ
router.get("/",jwt_decode.verifyToken,async function (req, res, next) {
    try {
      let orders = await Orders.find();
      return res.status(200).send({
        status: 200,
        data: orders,
        message: "success",
        success: true,
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: error.message,
        success: false,
      });
    }
  }
);

// แสดง order ของ product นั้น
// router.get("/:productId/orders", async function (req, res, next) {
//     const productId = req.params.productId;
//     console.log(productId);
//     try {
//       let orders = await Orders.find({ productId }).populate("productId");//เช็คค่าที่
//       console.log(orders.data);
  
//       if (!orders || orders.length === 0) {
//         return res.status(404).send({
//           status: 404,
//           message: "No orders found for this product",
//           success: false,
//         });
//       }
  
//       return res.status(200).send({
//         status: 200,
//         data: orders,
//         message: "success",
//         success: true,
//       });
//     } catch (error) {
//       return res.status(500).send({
//         status: 500,
//         message: error.message,
//         success: false
//       });
//     }
//   });

router.get("/:id/orders",jwt_decode.verifyToken, async function (req, res, next) {
    try {
        let productId = req.params.id;
        let orders = await Orders.find({ productId: productId })
            .populate("productId")//ค่อยหานะ
            .exec();//เรียกใช้งานpopulate

        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// router.get("/orders", async function (req, res, next) {
//     try {
//       let orders = await Orders.find({});
  
//       res.status(200).send(orders);
//     } catch (error) {
//       res.status(500).send(error.toString());
//     }
//   });
  
  
module.exports = router;
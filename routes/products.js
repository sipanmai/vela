const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const Product = require('../model/product');
const Orders = require('../model/order'); 
const jwt_decode = require('../middleware/jwt_decode');

// GET /api/products - แสดงรายการสินค้า
router.get('/products',jwt_decode.verifyToken, async (req, res) => {
    try {
        const products = await Product.find();// ดึงข้อมูลจากฐานข้อมูล

        // ส่งข้อมูลกลับเป็น JSON
        res.status(200).json(products);

    } catch (err) {
            res.status(500).json({ 
                message: 'Error fetching products', 
                error: err.message 
            });
            }
});
        
// POST  - เพิ่มสินค้าใหม่
router.post('/addproducts',jwt_decode.verifyToken, async (req, res) => {
    const { name, price, item, description, category } = req.body;

    // ตรวจสอบว่าข้อมูลทั้งหมดถูกส่งมาและไม่ว่างเปล่า
    if (!name || !price || !item ) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newProduct = new Product({
            name,
            price,
            item,
            
        });

        // บันทึกสินค้าใหม่ในฐานข้อมูล
        const savedProduct = await newProduct.save();
        res.status(201).json({
            message: 'Product added successfully',
            data: savedProduct
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


// PUT /Products/:id - แก้ไขสินค้า โดยแทนที่ :id เป็น id ของสินค้านั้นที่ต้องการแก้ไข
router.put('/editproducts/:id',jwt_decode.verifyToken, async (req, res) => {
    const { id } = req.params;
    const { name, price, item} = req.body;

    // ตรวจสอบว่ามีการส่งข้อมูลที่จะอัปเดตมาหรือไม่
    if (!name && !price && !item ) {
        return res.status(400).json({ message: 'At least one field is required to update' });
    }

    try {
        // สร้างอ็อบเจกต์ใหม่สำหรับอัปเดตข้อมูล
        const updatedProduct = {};
        if (name) updatedProduct.name = name;
        if (price) updatedProduct.price = price;
        if (item) updatedProduct.item = item;
        

        // อัปเดตสินค้าในฐานข้อมูล
        const product = await Product.findByIdAndUpdate(id, updatedProduct, { new: true });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product updated successfully',
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// DELETE /products/:id - ลบสินค้า
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {

        // ลบสินค้าจากฐานข้อมูล
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product deleted successfully',
            data: deletedProduct
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// GET  แสดงรายการสินค้าตามID (ใช้ GET เพื่อดึงข้อมูลสินค้าตาม ID จากฐานข้อมูล MongoDB) ดู products1 รายการ
//ฟังก์ชัน async ทำให้ฟังก์ชันนี้เป็น asynchronous และสามารถใช้ await ได้ภายในฟังก์ชัน
//req เป็น request object เอาข้อมูลการร้องขอเข้ามา
//res เป็น response object ส่งข้อมูลกลับไปยังผู้ร้องขอ
router.get('/:id', jwt_decode.verifyToken,async (req, res) => {
    const { id } = req.params;  //req.params เก็บค่าพารามิเตอร์ทั้งหมดที่ส่งมาทาง URL

    try {
        const product = await Product.findById(id); // ดึงข้อมูลสินค้าตาม ID จากฐานข้อมูล

        // ตรวจสอบว่ามีสินค้าหรือไม่
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // ส่งข้อมูลสินค้ากลับเป็น JSON
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ 
            message: 'Error fetching product', 
            error: err.message 
        });
    }
});

// POST - อัปเดตจำนวน item ของสินค้าที่มีอยู่แล้ว
router.post('/updateItem/:id',jwt_decode.verifyToken, async (req, res) => {
    const { id } = req.params;
    const { item } = req.body;

    // ตรวจสอบว่ามีการส่งจำนวน item มาหรือไม่
    if (item === undefined) {
        return res.status(400).json({ message: 'Item quantity is required' });
    }

    try {
        // ค้นหาสินค้าตาม ID ที่ใส่มา
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // อัปเดตจำนวน item ของสินค้าที่มีอยู่
        product.item += item;
        await product.save();

        res.status(200).json({
            message: 'Product item updated successfully',
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

//products 1อัน (เพิ่ม orders ใน products)
router.post("/:id/orders",jwt_decode.verifyToken,async function (req, res, next) {
      const id = req.params.id;
      try {
        const { item } = req.body;
  
        const product = await Product.findById(id);
        // ตรวจสอบว่าพบสินค้าหรือไม่
        if (!product) {
          return res.status(404).send({
            status: 404,
            message: "Product not found",
            success: false,
          });
        }
        // ตรวจสอบว่าสินค้ามีจำนวนพอหรือไม่
        if (product.item < item) {
          return res.status(400).send({
            status: 400,
            message: "Product out of stock",
            success: false,
          });
        }
        // Create a new order
        const newOrder = new Orders({
          name: product.name,
          item,
          productId: id,
        });
  
        // Save the order to the database
        await newOrder.save();
  
        // Update product to include the order ID in its 'order' array
        // product.Orders.push(newOrder._id);
        product.item -= item;
        await product.save();
  
        // Respond with success message
        res.status(200).json({
          status: 200,
          data: newOrder,
          message: "Order added successfully",
          success: true,
        });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
          status: 500,
          message: error.message,
          success: false,
        });
      }
    }
  );



module.exports = router;

const express = require("express");
const router = express.Router();
//เข้ารหัสผ่าน
const bcrypt = require("bcrypt");
const User = require("../model/user");
const jwt = require('jsonwebtoken');

// POST /register - สมัครสมาชิก รับข้อมูลจากผู้ใช้มา
router.post("/register", async function (req, res) {
    try {
        // รับข้อมูลจาก req.body
        let { password, username, firstName, lastName, email } = req.body;

        // ตรวจสอบว่าข้อมูลทั้งหมดถูกส่งมาและไม่ว่างเปล่า
        if (!username || !password || !firstName || !lastName || !email) {
            return res.status(400).send({
                message: "All fields are required",
                success: false,
            });
        }

        // ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(200).send({
                message: "Username already exists",
                success: false,
            });
        }

        // เข้ารหัสผ่าน
        let hashPassword = await bcrypt.hash(password, 10);

        // สร้างผู้ใช้ใหม่
        const newUser = new User({
            username,
            password: hashPassword,
            firstName,
            lastName,
            email,
            status: false // กำหนดค่า status เป็น false
        });

        // บันทึกผู้ใช้ใหม่ในฐานข้อมูล
        const user = await newUser.save();

        // ส่งค่ากลับไปยังผู้ใช้
        return res.status(201).send({
            data: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                status: user.status
            },
            message: "User created successfully",
            success: true,
        });
    } catch (error) {
        console.log(error);
        // ส่งข้อความแสดงข้อผิดพลาด
        return res.status(500).send({
            message: "User creation failed",
            success: false,
            error: error.message
        });
    }
});

// PUT /login - เข้าสู่ระบบ
router.post("/login", async function (req, res) {
    try {
        // รับข้อมูลจาก req.body
        let { password, username } = req.body;

        // ตรวจสอบว่าข้อมูลถูกส่งมาและไม่ว่างเปล่า
        if (!username || !password) {
            return res.status(400).send({
                message: "Username and password are required",
                success: false,
            });
        }

        // ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
         const existingUser = await User.findOne({ username });

        if (existingUser) {
            // ตรวจสอบผู้ใช้
            if(!username){
                return res.status(401).send({
                    message: "Incorrect username",
                    success: false,
                });
            }
        
             const checkPassword = await bcrypt.compare(password, existingUser.password);
            if (!checkPassword) {
                return res.status(401).send({
                    message: "Incorrect password",
                    success: false,
                });
            }

            //ตรวจสอบสถานะของผู้ใช้ 
            if (!existingUser.status) {
                return res.status(401).send({
                    message: "wait approve",
                    success: false,
                });
            }  else if(existingUser.status){
                const { _id, status } = existingUser;
                const payload = { _id, status };
                const token = jwt.sign(payload,process.env.JWT_KEY);

        return res.status(200).send({
        token: token,
        status: 200,
        message: "login success",
        success: true,
      });
            }
            

            // สร้าง JWT token ฟังก์ชัน jwt.sign จะคืนค่า token ที่เป็นสตริง จากรหัสผ่าานที่แสดงเป็นตัวเลข มันจะเป็นภาษาแปลกๆล่ะ
            // const token = jwt.sign(
            //     {
            //         id: updatedUser._id,
            //         username: updatedUser.username,
            //         firstName: updatedUser.firstName,
            //         lastName: updatedUser.lastName,
            //         email: updatedUser.email
            //     }, process.env.JWT_KEY
            // )
                
            // return res.status(200).send({
            //     data: {
            //         id: updatedUser._id,
            //         username: updatedUser.username,
            //         firstName: updatedUser.firstName,
            //         lastName: updatedUser.lastName,
            //         email: updatedUser.email,
            //         status: updatedUser.status,
            //         token // ส่ง JWT token กลับไปด้วย
            //     },
            //     message: "User logged in successfully",
            //     success: true,
            // });
            } else {
            return res.status(404).send({
                message: "User not found",
                success: false,
            });
        }
    } catch (error) {
        console.log(error);
        // ส่งข้อความแสดงข้อผิดพลาด
        return res.status(500).send({
            message: "User login failed",
            success: false,
            error: error.message
        });
    }
});

router.put("/approve/:id" ,async function (req, res) {
    try {
        // อัปเดตสถานะของผู้ใช้เป็น true โดยใช้ findByIdAndUpdate
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, // ใช้ _id ของผู้ใช้ที่ได้จาก existingUser
            { status: true }, // อัปเดตสถานะเป็น true
            { new: true } // ตัวเลือกนี้จะทำให้ MongoDB ส่งเอกสารที่อัปเดตแล้วกลับมา
        ); console.log(updatedUser)
         return res.status(200).send({
            updatedUser,
            message: "approve success",
            success: true

        })
    
} catch (error) {
    return res.status(500).send({
        message: "User login failed",
        success: false,
        error: error.message
    });
}
    
})

module.exports = router;

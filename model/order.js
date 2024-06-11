const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name: { type: String, required: true },
    item: { type: Number, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },//ไปดึงข้อมูล productId จากdatabase ของตารางproduct
});

module.exports = mongoose.model('Orders', orderSchema);
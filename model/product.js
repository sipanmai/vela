const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    item: {type: Number, required: true},
    
    // Orders: [{type: mongoose.Schema.Types.ObjectId, ref: "Orders", }]
});

module.exports = mongoose.model('Products', productSchema);
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const { DB_HOST, DB_PORT, DB_NAME } = process.env;
        const conn = await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
           
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB');
        process.exit(1);
    }
};

module.exports = connectDB;
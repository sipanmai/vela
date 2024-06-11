const mongoose = require('mongoose');
const users = new mongoose.Schema({
    username: {type : String, unique:true},
    password: {type : String},
    firstName: {type : String},
    lastname: {type : String},
    email: {type : String},
    status : {type : Boolean, default : false}
});
module.exports = mongoose.model("users",users);
const mongoose = require('mongoose')
const cart_model = require('./cart_model')

const model = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    cart: [cart_model],
    orders: []
})

module.exports = mongoose.model('users', model)
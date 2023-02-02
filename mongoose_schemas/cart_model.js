const mongoose = require('mongoose')

const model = new mongoose.Schema({
    id: String,
    type: {
        type: String,
        default: "ingredient"
    },
    price: Number, 
    name: String,
    image: String,
    toppings: [
        {
            id: Number,
            price: Number,
            name: String,
            image: String,
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    quantity: {
        type: Number,
        default: 1
    }
})

module.exports = model
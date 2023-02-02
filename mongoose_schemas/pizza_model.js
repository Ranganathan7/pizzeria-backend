const mongoose = require('mongoose')

const model = mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    type: String,
    price: Number, 
    name: String,
    image: String,
    description: String,
    ingredients: Array,
    topping: Array
})

module.exports = mongoose.model('pizzas', model)
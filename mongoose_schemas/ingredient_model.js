const mongoose = require('mongoose')

const model = mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    tname: String,
    price: Number,
    image: String
})

module.exports = mongoose.model('ingredients', model)
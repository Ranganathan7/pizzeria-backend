const mongoose = require('mongoose')

const model = mongoose.Schema({
    chefs: String,
    ingredients: String,
    story: Array
})

module.exports = mongoose.model('contents', model)
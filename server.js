require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Pizzas = require('./mongoose_schemas/pizza_model')
const Ingredients = require('./mongoose_schemas/ingredient_model')
const Contents = require('./mongoose_schemas/content_model')
const Users = require('./mongoose_schemas/user_model')
const cors = require('cors')
const PORT = process.env.PORT || 5000
const bcrypt = require('bcrypt')
const saltRounds = 10

mongoose.connect(process.env.DB_URL)
    .then((res) => console.log("connected successfully"), (err) => console.log(err))

const app = express()

app.use(express.json())
app.use(cors())

//getting the pizzas list from out database
app.get("/pizzeria/pizzas", (req, res) => {
    let status = 404
    const msg = {}
    Pizzas.find({}, (err, pizzas) => {
        if (!err) {
            msg.data = pizzas
            status = 200
        }
        else msg.message = err
        // console.log(msg)
        res.status(status).json(msg)
    })
})

//getting ingredients list from our database
app.get("/pizzeria/ingredients", (req, res) => {
    let status = 404
    const msg = {}
    Ingredients.find({}, (err, ingredients) => {
        if (!err) {
            msg.data = ingredients
            status = 200
        }
        else msg.message = "Failed to fetch ingredients"
        //console.log(msg)
        res.status(status).json(msg)
    })
})

//getting the home screen contents from our database
app.get("/pizzeria/contents", (req, res) => {
    let status = 404
    const msg = {}
    Contents.find({}, (err, contents) => {
        if (!err) {
            msg.data = contents
            status = 200
        }
        else msg.message = "Failed to fetch contents"
        //console.log(msg)
        res.status(status).json(msg)
    })
})

//sending the cart of requested user email
app.post("/pizzeria/cart", (req, res) => {
    let status = 404
    const msg = {}
    // console.log(req.body)
    Users.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            msg.message = "mongodb error"
            res.status(status).json(msg)
        }    
        else if (!user) {
            msg.message = "No User Found"
            res.status(status).json(msg)
        }
        else {
            status = 200
            msg.data = user.cart
            res.status(status).json(msg)
        }
    })
})

//registering a new user into our database
app.post("/pizzeria/users", (req, res) => {
    let status = 404
    const msg = {}

    bcrypt.hash(req.body.password, saltRounds, function (error_bcrypt, hash) {
        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            cart: [],
            orders: []
        })
        //checking if the email already exists in our database
        Users.findOne({ email: req.body.email }, (err, user_found) => {
            if (err) {
                msg.message = "mongodb error"
                res.status(status).json(msg)
            }
            else if (!user_found) {
                user.save(error => {
                    if (error) {
                        msg.message = "Failed to register"
                    }
                    else {
                        msg.data = "User registered"
                        status = 200
                    }

                    res.status(status).json(msg)
                })
            }
            else {
                status = 200
                msg.message = "User already exists!"
                res.status(status).json(msg)
            }
        })
    })
})

//authenticating a user when he tries to login
app.post("/pizzeria/login", (req, res) => {
    let status = 404
    const msg = {}
    // console.log(req.body.email, req.body.password)
    Users.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            msg.message = "mongodb error"
            res.status(status).json(msg)
        }
        else if (!user) {
            msg.message = "No User Found"
            res.status(status).json(msg)
        }
        else {
            bcrypt.compare(req.body.password, user.password, function (error, result) {
                if (result) {
                    msg.data = user
                    status = 200
                    res.status(status).json(msg)
                }
                else {
                    msg.message = "Invalid Credentials"
                    res.status(status).json(msg)
                }
            })
        }
    })
})

app.post("/pizzeria/add-to-cart", (req, res) => {
    let status = 404
    const msg = {}
    // console.log(req.body.email, req.body.pizza)
    Users.findOne({ email: req.body.email },
        (err, user) => {
            if (err) {
                msg.message = "mongodb error"
                res.status(status).json(msg)
            }
            else if (!user) {
                msg.message = "user not found"
                res.status(status).json(msg)
            }
            else {
                Users.findOneAndUpdate({ email: req.body.email },
                    { $push: { cart: req.body.pizza } },
                    (error, result) => {
                        if (error) {
                            msg.message = "mongodb error"
                            res.status(status).json(msg)
                        }
                        else {
                            status = 200
                            msg.data = "Added to cart"
                            res.status(status).json(msg)
                        }
                    })
            }
        })
})

//updating the cart when user adds/removes an item 
app.post("/pizzeria/update-cart", (req, res) => {
    let status = 404
    const msg = {}
    // console.log(req.body.email, req.body.pizza)
    Users.findOne({ email: req.body.email },
        (err, user) => {
            if (err) {
                msg.message = "mongodb error"
                res.status(status).json(msg)
            }
            else if (!user) {
                msg.message = "user not found"
                res.status(status).json(msg)
            }
            //when user tries to remove an item from the cart
            else if (req.body.action === 0) {
                const cart = user.cart
                const updated_cart = cart.filter(pizza => pizza.id !== req.body.pizza.id)
                Users.findOneAndUpdate({ email: req.body.email },
                    { $set: { cart: updated_cart } },
                    (error, result) => {
                        if (error) {
                            msg.message = "mongodb error"
                            res.status(status).json(msg)
                        }
                        else {
                            status = 200
                            msg.data = "Item removed from cart"
                            res.status(status).json(msg)
                        }
                    })
            }
            else {
                const cart = user.cart
                cart.map(pizza => {
                    if (pizza.id.localeCompare(req.body.pizza.id) === 0) {
                        pizza.quantity = pizza.quantity + req.body.action
                        return pizza
                    }
                    else return pizza
                })
                Users.findOneAndUpdate({ email: req.body.email },
                    { $set: { cart: cart } },
                    (error, result) => {
                        if (error) {
                            msg.message = "mongodb error"
                            res.status(status).json(msg)
                        }
                        else {
                            status = 200
                            msg.data = "Updated the cart"
                            res.status(status).json(msg)
                        }
                    })
            }
        })
})

//updating the cart when user customizes the toppings 
app.post("/pizzeria/update-cart/toppings", (req, res) => {
    let status = 404
    const msg = {}
    // console.log(req.body.email, req.body.pizza)
    Users.findOne({ email: req.body.email },
        (err, user) => {
            if (err) {
                msg.message = "mongodb error"
                res.status(status).json(msg)
            }
            else if (!user) {
                msg.message = "user not found"
                res.status(status).json(msg)
            }
            else {
                const cart = user.cart
                cart.map(pizza => {
                    if (pizza.id === req.body.pizza.id) {
                        //checking if user tries to remove
                        if (req.body.action === 0) {
                            pizza.toppings = pizza.toppings.filter(topping => topping.id !== req.body.toppings.id)
                            pizza.price = pizza.price - req.body.toppings.price
                        }
                        else {
                            //adding the topping 
                            req.body.toppings.map(topping => {
                                const cart_topping = {
                                    id: topping.id,
                                    type: topping.type,
                                    price: topping.price,
                                    name: topping.tname,
                                    image: topping.image
                                }
                                const index = pizza.toppings.indexOf(cart_topping)
                                if(index===-1){
                                    pizza.toppings.push(topping)
                                    pizza.price = pizza.price + topping.price
                                }   
                            })
                        }
                        return pizza
                    }
                    else return pizza
                })
                Users.findOneAndUpdate({ email: req.body.email },
                    { $set: { cart: cart } },
                    (error, result) => {
                        if (error) {
                            msg.message = "mongodb error"
                            res.status(status).json(msg)
                        }
                        else {
                            status = 200
                            msg.data = "Added to cart"
                            res.status(status).json(msg)
                        }
                    })
            }
        })
})

//making / inserting the order details 
app.post("/pizzeria/orders", (req, res) => {
    let status = 404
    const msg = {}
    Users.findOneAndUpdate({ email: req.body.email },
        { $push: { orders: req.body.order } },
        (error, result) => {
            if (error) {
                msg.message = "mongodb error"
                res.status(status).json(msg)
            }
            else {
                status = 200
                msg.data = "Added to your orders!"
                res.status(status).json(msg)
            }
        })
})

//sending the order details or requested user email
app.post("/pizzeria/get-orders", (req, res) => {
    let status = 404
    const msg = {}
    Users.findOne({ email: req.body.email },
        (error, user) => {
            if (error) {
                msg.message = "mongodb error"
                res.status(status).json(msg)
            }
            else {
                status = 200
                msg.data = user.orders
                res.status(status).json(msg)
            }
        })
})

//emptying the user cart once he checksout the cart items
app.post("/pizzeria/empty-cart", (req, res) => {
    let status = 404
    const msg = {}
    Users.findOneAndUpdate({ email: req.body.email },
        { $set: { cart: [] } },
        (error, result) => {
            if (error) {
                msg.message = "mongodb error"
                res.status(status).json(msg)
            }
            else {
                status = 200
                msg.data = "Emptied the cart"
                res.status(status).json(msg)
            }
        })
})

app.listen(PORT, () => console.log("server running in port:", PORT))


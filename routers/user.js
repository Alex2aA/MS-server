//init router-express
const Router = require('express')

//export express-validator
const {check} = require("express-validator")

//export middlewares functions
const authMiddleware = require('../middlewares/authMiddleware')

//export routing classes
const usersController = require('../controllers/usersController')

//create new class userRouter
const userRouter = new Router()

userRouter.get('/all_users',authMiddleware, usersController.getUsers)
userRouter.post('/registration', [
    check('username', "The login field cannot be empty").notEmpty(),
    check('username', "The username field must be less than 15 characters").isLength({max:20}),
    check('password', "The password field must be longer than 8 characters").isLength({min:8}),
    check('password', 'The password field must be less than 15 characters').isLength({max:15}),
    check('email', 'Email must be correct').isEmail()
], usersController.registartion )
userRouter.post('/login', usersController.login )
userRouter.get('/refresh', usersController.refresh )
userRouter.get('/activate/:link',authMiddleware, usersController.activate)

module.exports = userRouter
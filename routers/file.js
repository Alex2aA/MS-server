const Router = require('express')

const usersController = require('../controllers/usersController')
const authMiddleware = require('../middlewares/authMiddleware.js')

const fileRouter = new Router()

fileRouter.post('/avatar', authMiddleware, usersController.saveAvatar )

module.exports = fileRouter
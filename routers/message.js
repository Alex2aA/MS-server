const Router = require('express')

const authMiddleware = require('../middlewares/authMiddleware')
const messageController = require('../controllers/messagesController')

messageRouter = new Router()

messageRouter.post('/create_new_dialog', authMiddleware, messageController.createNewDialog)
messageRouter.post('/save_message', authMiddleware, messageController.saveMessage)
messageRouter.delete('/delete_message', authMiddleware, messageController.deleteMessage)
messageRouter.get('/get_messages', authMiddleware, messageController.getMessages)
messageRouter.post('/edit_message', authMiddleware, messageController.editMessage)

module.exports = messageRouter
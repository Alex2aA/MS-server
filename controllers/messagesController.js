const messageService = require('../service/message-service')

class MessagesController {

    async createNewDialog(req, res) {
        try {
            let users = req.body.users
            users.push(req.user.id)
            const resultReq = await messageService.createNewDialog(users)
            return res.status(resultReq.status).json(resultReq)
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: 'Something went wrong'})
        }
    }

    async saveMessage(req, res) {
        try {
            let resultReq = {}
            if(!req.files) {
                resultReq = await messageService.saveMessage(req.user.id, req.body.dialogId, req.body.text)
            } else {
                resultReq = await messageService.saveMessage(req.user.id, req.query.dialog_id, Array.isArray(req.files.messageFiles) ? req.files.messageFiles : [req.files.messageFiles], true)
            }
            return res.status(resultReq.status).json(resultReq)
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: 'Something went wrong'})
        }
    }

    async deleteMessage(req, res) {
        try {
            const resultReq = await messageService.deleteMessage(req.body.messageId, req.user.id)
            return res.status(resultReq.status).json(resultReq)
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: 'Something went wrong'})
        }
    }

    async getMessages(req, res) {
        try {
            const resultReq = await messageService.getMessages(req.query.dialog_id)
            return res.status(resultReq.status).json(resultReq)
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: 'Something went wrong'})
        }
    }

    async editMessage(req, res) {
        try {
            const resultReq = await messageService.editMessage(req.user.id, req.body.messageId, req.body.text)
            return res.status(resultReq.status).json(resultReq)
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: 'Something went wrong'})
        }
    }

}

module.exports = new MessagesController()
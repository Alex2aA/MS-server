const pool = require('../db.js')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const userService = require('../service/user-service.js')

class usersController {
    
    //user-service login(email, password)
    async login(req,res) {
        try {
            const {email, password} = req.body
            const resultReq = await userService.login(email, password)
            return res.status(resultReq.status).json(resultReq)

        } catch (error) {
            console.log(error)
            return res.status(resultReq.status ? resultReq.status : 500).send({error, message: resultReq.message ? resultReq.message : 'Something went wrong'})
        }
    }

    //user-service refresh(refreshToken)
    async refresh(req,res) {
        try {
            const {refreshToken} = req.query
            const resultReq = await userService.refresh(refreshToken)
            return res.status(resultReq.token.status).json(resultReq)
        } catch (error) {
            console.log(error)
            return res.status(resultReq.token.status ? resultReq.token.status : 500).send({error, message: resultReq.message ? resultReq.message : 'Something went wrong'})
        }
    }

    //user-service registration(username,password,email)
    async registartion(req,res) {
        try {
            
            const {username, password, email} = req.body

            const result = validationResult(req)
            if(!result.isEmpty()) {
                const error = result.errors[0]
                console.log(result)
                return res.status(400).json(error)
            }

            const resultReq = await userService.registration(username,password,email)
            return res.status(resultReq.status).json(resultReq)
        } catch (error) {
            console.log(error)
            return res.status(resultReq.status ? resultReq.status : 500).send({error, message: resultReq.message ? resultReq.message : 'Something went wrong'})
        }
    }

    //user-service activate(activationLink)
    async activate(req,res) {
        try {
            const activationLink = req.params.link
            const resultReq = await userService.activate(activationLink)
            return res.status(resultReq.status).json(resultReq)
        } catch (error) {
            console.log(error)
            return res.status(resultReq.status ? resultReq.status : 500).send({error, message: resultReq.message ? resultReq.message : 'Something went wrong'})
        }
    }

    //user-serivce getUsers test func
    async getUsers(req,res) {
        try {
            const resultReq = await userService.getUsers()
            return res.status(resultReq.status).json(resultReq)
        } catch (error) {
            return res.status(500).json({message: 'Something went wrong'})
        }
    }
}
module.exports = new usersController()
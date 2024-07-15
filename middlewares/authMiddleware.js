const jwt = require('jsonwebtoken')
const {jwt_access_secret, jwt_refresh_secret} =require('../config.js')
const tokenService = require('../service/token-service.js')

module.exports = function (req,res,next) {
    try {
        const auth = req.headers.authorization.split(' ')[1]
        if(!auth) {
            return res.status(401).json({message: 'You are not authorized'})
        }
        const userData = tokenService.getAccessToken(auth)
        if (userData.status == 401) {
            return res.status(userData.status).json({message: userData.message})
        }

        req.user = userData
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({message: 'You are not authorized'})
    }
}
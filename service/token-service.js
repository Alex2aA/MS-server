const jwt = require('jsonwebtoken')
const pool = require('../db.js')
const {jwt_access_secret,jwt_refresh_secret} = require('../config.js')

class TokenService {

    generateAccessToken = (payload, refreshToken = false) => {
        if(!refreshToken) {
            return {
                status: 200,
                accessToken: jwt.sign(payload, jwt_access_secret, {expiresIn:'15s'}),
                refreshToken: jwt.sign(payload, jwt_refresh_secret, {expiresIn:'24h'}),
                message: 'Tokens successfully created'
            }
        }
        return {
            status: 200,
            accessToken: jwt.sign(payload, jwt_access_secret, {expiresIn:'15s'}),
            message: 'Token successfully created'
        }
    }
    getAccessToken = (refreshToken) => {
        let tokenDecoded
        if(jwt.verify(refreshToken, jwt_refresh_secret, function (err, decoded) {
            if(err) {
                return false
            }
            tokenDecoded = decoded
            return true
        })) {
            const accessToken = this.generateAccessToken({id: tokenDecoded.id, email: tokenDecoded.email}, true)
            return {
                status: 200, 
                accessToken: accessToken,
                message: 'Token updated successfully',
            }
        }
        return {
            status: 401,
            message: 'Your session has expired, please log in again'
        }
    }
}

module.exports = new TokenService()
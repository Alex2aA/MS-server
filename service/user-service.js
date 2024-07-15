const pool = require('../db.js')
const bcrypt = require('bcryptjs')
const uuid = require('uuid')
const mailService = require('./mail-service.js')
const tokenService = require('./token-service.js')
const config = require('../config.js')
const jwt = require('jsonwebtoken')

class UserService {

    //test function to check middleware works
    async getUsers() {
        let data = await pool.query('SELECT * FROM users')
        return { status: 200, users: data.rows}
    }
   
    async registration(username, password, email) {

            let data = await pool.query('SELECT * FROM users WHERE username=$1 OR email=$2', [username, email])

            //Checking for data correctness
            if (data.rows.length != 0) {
                if(data.rows[0].username == username) {
                    return { status: 400, message: 'A user with the same name already exists' }
                }
                if(data.rows[0].email == email) {
                    return { status: 400, message: 'A user with this email already exists' }
                }
            }

            //create hash_password by bcrypt&create activationLink by uuid v4
            const hash_password = bcrypt.hashSync(password, 7)
            const activationLink = uuid.v4()

            //send activation mail to our email
            if (!await mailService.sendActivationMail(email, `${config.url_api}/api/activate/${activationLink}`)) {
                return { status:500, message: 'The application was unable to send you an activation email' }
            }

            //save user in db
            data = await pool.query('INSERT INTO users (username, hash_password, email, activation_link ) VALUES ($1, $2, $3, $4)', [username, hash_password, email, activationLink])

            //get data user for tokens
            data = await pool.query('SELECT * FROM users WHERE username=$1',[username])

            //create accesstoken&refreshtoken
            const token = tokenService.generateAccessToken({id: data.rows[0].id, email: data.rows[0].email})

            //return data
            return {
                status: 200,
                message: ('You have successfully registered'),
                tokens: token
            }
    }

    async refresh(refreshToken) {
        let token = tokenService.getAccessToken(refreshToken)
        return {token: token}
    }

    async login(email,password) {

        //find a user with same email
        let data = await pool.query('SELECT * FROM users WHERE email=$1', [email]) 

        if(data.rows.length == 0) {
            return { status: 400, message: `User with this email: ${email} not found` }
        }

        //if user with same email not found then check password
        const validPassword = bcrypt.compareSync(password, data.rows[0].hash_password)

        //wrong password
        if (!validPassword) {
            return { status: 400, message: `Wrong password` }
        }

        //generate token&refresh token for user
        const token = tokenService.generateAccessToken({id: data.rows[0].id, email: data.rows[0].email})

        return { status: 200, token: token, message: 'You are logged in'}
    }

    async activate(activationLink) {
        const user = await pool.query('SELECT * FROM users WHERE activation_link=$1',[activationLink])
        if(user.length == 0) {
            return { status: 500, message: 'Incorrect activation link'}
        }
        await pool.query('UPDATE users SET is_activated=$1 WHERE activation_link=$2',[true, activationLink])
        return { status: 200, message: 'You have successfully verified your email'}
    }
}

module.exports = new UserService()
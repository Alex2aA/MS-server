const pool = require('../db.js')
const bcrypt = require('bcryptjs')
const uuid = require('uuid')
const mailService = require('./mail-service.js')
const tokenService = require('./token-service.js')
const config = require('../config.js')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')

class UserService {

    //test function to check middleware works
    async getUsers() {
        let data = await pool.query('SELECT username, avatar FROM users')
        for (const user of data.rows) {
            if(user.avatar) {
                user.avatar = btoa(fs.readFileSync(user.avatar).data)
            }
        }
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
            const id = uuid.v4()

            //create uniq directory
            let created = false
            fs.mkdirSync(`/app/users_data/${id}`, (error) => {
                console.log(error)
            }, created = true)
            if (!created) {
                return { status: 500, message: 'Can not create a directory for user'}
            }

            //send activation mail to our email
            if (!await mailService.sendActivationMail(email, `${config.url_api}/api/activate/${activationLink}`)) {
                return { status:500, message: 'The application was unable to send you an activation email' }
            }

            //save user in db
            data = await pool.query('INSERT INTO users (id, username, hash_password, email ) VALUES ($1, $2, $3, $4)', [id, username, hash_password, email])

            //get data user for tokens
            data = await pool.query('SELECT * FROM users WHERE username=$1',[username])

            //create accesstoken&refreshtoken
            const token = tokenService.generateAccessToken({id: data.rows[0].id, email: data.rows[0].email})

            //return data
            return {
                status: 200,
                message: ('You have successfully registered'),
                token
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

    async activate(userId) {
        const user = await pool.query('SELECT * FROM users WHERE id=$1',[userId])
        if(user.length == 0) {
            return { status: 500, message: 'Incorrect activation link'}
        }
        if(user.rows[0].is_activated) {
            return { status: 400, message: 'Your email is already verified'}
        }
        await pool.query('UPDATE users SET is_activated=$1 WHERE id=$2',[true, userId])
        return { status: 200, message: 'You have successfully verified your email'}
    }

    async saveAvatar(user_id, file) {
        if(!file) {
            return {status: 400, message: 'Something went wrong'}
        }
        try {
            const avatar = await pool.query('SELECT avatar FROM users WHERE id=$1',[user_id])
            
            if (!fs.existsSync(`/app/users_data/${user_id}/avatar`)) {
                fs.mkdirSync(`/app/users_data/${user_id}/avatar`)
            }

            if (fs.existsSync(`${avatar.rows[0].avatar}`)) {
                fs.rmSync(`${avatar.rows[0].avatar}`)
            }

            file.mv(path.join(`/app/users_data/${user_id}/avatar/`) + user_id + ' ' + file.name)

            await pool.query('UPDATE users SET avatar=$1 WHERE id=$2', [`/app/users_data/${user_id}/avatar/${user_id} ${file.name}`, user_id])

            return {status: 200, message: 'You have successfully updated your avatar'}

        } catch (error) {
            console.log(error)
            return {status: 500, message: 'Something went wrong'}
        }
    }
}

module.exports = new UserService()
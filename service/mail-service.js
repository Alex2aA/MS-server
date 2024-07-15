const nodeMailer = require("nodemailer")
const config = require('../config.js')

class MailService {

    constructor() {
        this.transporter = nodeMailer.createTransport({
            host: config.smtp_host,
            port: config.smtp_port,
            secure: true,
            auth: {
                user: config.smtp_user,
                pass: config.smtp_password
            }
        })
    }

    async sendActivationMail(to, link) {
        try {
            await this.transporter.sendMail({
                from: config.smtp_user,
                to,
                subject: 'Account activation',
                text: '',
                html: 
                `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
            })
            return true   
        } catch (error) {
            console.log(error)
            return false
        }
    }
}

module.exports = new MailService()
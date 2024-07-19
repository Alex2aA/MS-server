const pool = require('../db.js')
const uuid = require('uuid')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

class MessageService {

    async createNewDialog(users) {
        const dialogId = uuid.v4()
        await pool.query(`INSERT INTO public.dialog (id) VALUES($1)`,[dialogId])
        for (const userId of users) {
            await pool.query(`INSERT INTO public.users_to_dialog (dialog_id, user_id) VALUES($1, $2)`, [dialogId, userId]) 
        }

        return {status:200, message: 'Dialog created successfully'}

    }

    async saveMessage(authorId, dialogId, content, files = false) {
        let messageId = uuid.v4()
        const url = '/app/users_data'
        if (!files) {
            await pool.query("INSERT INTO public.message (id, text, dialog_id, author_id) VALUES($1, $2, $3, $4)",[messageId, content, dialogId, authorId])
        } else {
            const pathJoin = `${url}/${authorId}/file_messages/${dialogId}/`
            if(!fs.existsSync(`${url}/${authorId}/file_messages`)) {
                fs.mkdirSync(`${url}/${authorId}/file_messages`)
            }

            if(!fs.existsSync(pathJoin)) {
                fs.mkdirSync(pathJoin)
            }
            for (const file of content) {
                if(fs.existsSync(pathJoin + authorId + ' ' + file.name)) {
                    file.mv(path.join(pathJoin) + authorId + ' ' + file.name)
                } else {
                    file.mv(path.join(pathJoin) + authorId + ' ' + file.name)
                    messageId = uuid.v4()
                    await pool.query("INSERT INTO public.message (id, text, dialog_id, author_id, is_file) VALUES($1, $2, $3, $4, $5)",[messageId, pathJoin + authorId + ' ' + file.name, dialogId, authorId, true])
                }
            }
        }

        return {status: 200, message: 'Message successfully save'}
    }

    async deleteMessage(id, authorId) {
        const message = await pool.query("SELECT * FROM public.message WHERE id=$1",[id])
        if (authorId == message.rows[0].author_id) {
            await pool.query("DELETE FROM public.message WHERE id=$1",[id])
            return {status: 200, message: 'Message successfully deleted'}
        } else {
            return {status: 400, message: 'You have no rights'}
        }
    }

    async getMessages(dialogId) {
        const messages = await pool.query('SELECT * FROM message WHERE dialog_id=$1', [dialogId])

        for (const file of messages.rows) {
            if (file.is_file) {
                file.text = btoa(fs.readFileSync(file.text).data) 
            }
        }

        return {status: 200, messages: messages.rows}
    }

    async editMessage(authorId, messageId, text) {
        const messages = await pool.query('SELECT * FROM message WHERE author_id=$1 AND id=$2', [authorId,messageId])

        if (messages.rows.length != 0 && !messages.rows[0].is_file) {
            await pool.query('UPDATE message SET text=$1 WHERE id=$2',[text, messageId])
            return {status:200, message: 'You have successfully updated your message'}
        } else {
            return {status: 400, message: 'You have no rights'}
        }
    }

}

module.exports = new MessageService()
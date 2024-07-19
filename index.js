const userRouter = require('./routers/user.js')
const fileRouter = require('./routers/file.js')
const messageRouter = require('./routers/message.js')
const fileUploader = require('express-fileupload')
const fs = require('fs')

const express = require('express')

const PORT = 8080

const app = express()
app.use(express.json())
app.use(fileUploader())

app.use('/api/users',userRouter)
app.use('/api/upload', fileRouter)
app.use('/api/message', messageRouter)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

if(!fs.existsSync(__dirname + '/users_data')) {
    fs.mkdirSync(__dirname + '/users_data')
}

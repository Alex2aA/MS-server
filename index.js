const userRouter = require('./routers/user.js')

const express = require('express')

const PORT = 8080

const app = express()
app.use(express.json())

app.use('/api/users',userRouter)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

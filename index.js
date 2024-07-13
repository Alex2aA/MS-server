const express = require('express')
const pool = require('./db')

const PORT = 8080

const app = express()
app.use(express.json())

app.get('/', async (req, res) => {
    try {
        const data = await pool.query(`SELECT * FROM public.user`)
        res.status(200).send(data.rows)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

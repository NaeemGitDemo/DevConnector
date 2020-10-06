const express = require('express')
const connectDB = require('./config/Connectdb')

const app = express()
const users = require('./routes/users')
const auth = require('./routes/auth')
const posts = require('./routes/posts')
const profile = require('./routes/profile')

const port = process.env.PORT || 5000

//Connect To Database
connectDB()
app.use(express.json())
app.use('/api', users)
app.use('/api', auth)
app.use('/api', posts)
app.use('/api', profile)


app.get('/', (req, res) => {
    res.send('DevConnector API Serves Is Running')
})
app.listen(port, () => {
    console.log('DevConnector Backend Server is running on port', port)
})
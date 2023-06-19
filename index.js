const express = require('express')
const app = express()
const port = 3005
const userController = require('./Controller/userController');

app.use(express.json());

//Route for Home Page
app.get('/', (req, res) => {
    res.send('Welcome to Home Page!')
})

//Route for Users Operations
app.use('/users', userController);

app.listen(port, () => {
    console.log(`Users app listening on port ${port}`)
})
const mongoose = require('mongoose')

exports.connect = () => {

    mongoose
    .connect("mongodb+srv://admin123:admin123@nodetraining.4eszwi2.mongodb.net/")
    .then(() => {
        console.log("Successfully connected to db")
    })
    .catch((error) => {
        console.log("db connection failed!")
        console.log(error)
        process.exit(1)
    })
}
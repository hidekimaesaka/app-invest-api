const mongoose = require("mongoose")


//Model de User
const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String,
})


module.exports = User
const mongoose = require("mongoose")


//Model de Wallet
const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String,
    products: [
        {
            product: String,
            bp: String,
            qtd: String
        }
    ],
})


module.exports = User
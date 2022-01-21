/* imports */
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const res = require("express/lib/response")
const cors = require("cors")

// Adicionando o express à uma variavel
const app = express()

// Config JSON response
app.use(express.json())
// Config CORS
app.use(cors())

//Models 
const User = require("./models/User")

//Rota pública
app.get("/", (req, res) => {
    res.status(200).json({ msg: "Bem vindo a API" })
})

//Rota privada
app.get("/user/:id", checkToken, async (req, res) => {

    const id = req.params.id

    //Verifica se o usuário existe
    const user = await User.findById(id, "-password")

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado!" })
    }

    res.status(200).json({ user })
})


//Função que verifica a integridade do TOKEN
function checkToken(req, res, next) {

    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ msg: "Acesso negado!" })
    }

    try {

        const secret = process.env.SECRET
        jwt.verify(token, secret)

        next()

    } catch (error) {
        res.status(400).json({ msg: "Token inválido!" })
    }

}

//Rota de Login de usuário
app.post("/auth/login", async (req, res) => {

    const { email, password, _id } = req.body

    /*Verifica se o usuário existe E instancia um objeto de usuário referente
    ao email inserido */
    const user = await User.findOne({ email: email })

    if (!user) {
        return res.status(422).json({ msg: "Usuário não encontrado" })
    }

    //Verifica se o usuário acertou a senha

    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
        return res.status(404).json({ msg: "Senha inválida!" })
    }

    try {

        const secret = process.env.SECRET
        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        )

        res.status(200).json({ msg: "Autenticação realizada com sucesso", token, id: user._id })

    } catch (error) {
        res.status(500).json({ msg: error })
    }

})




//Rota de Registro de usuário
app.post("/auth/register", async (req, res) => {

    const { name, email, password } = req.body

    //Verfica se o usuário ja existe
    const userExists = await User.findOne({ email: email })

    if (userExists) {
        return res.status(442).json({ msg: "e-Mail já cadastrado!" })
    }

    //Criar a senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //Criar usuário
    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {

        await user.save()

        res.status(201).json({ msg: "Usuário criado com sucesso!" })

    } catch (error) {
        res.status(500).json({ msg: error })
    }

})

// Rota de registro de produto
app.post("/wallet/new/:id", async (req, res) => {

    const product = req.body
    console.log(product)
    const id = req.params.id
    console.log(id)
    const user = await User.findById(id)
    

    try {
        await user.products.push(product)
        await user.save()

        res.status(201).json({ msg: "Produto cadastrado com sucesso!" })
    } catch (error) {
        res.status(404).json({ msg: "Ocorreu um erro inesperado!" })
    }

}
)

// Rota de consulta de carteira
app.get("/wallet/:id", async (req, res) => {

    const id = req.params.id
    const user = await User.findById(id)
    

    try {
        res.status(200).json(user.products)

    } catch (error) {
        res.status(404).json({ msg: "Ocorreu um erro inesperado!" })
    }

}
)

//Rota de deletar produto
app.post("/wallet/delete/:id", async (req, res) => {

    const id = req.params.id 

    const user = await User.findById(id)

    //Deve receber o id do produto, que fica no array Products
    const product_id = req.body.product
    
    

    try {
        await user.products.remove(product_id)
        await user.save()

        res.status(201).json({ msg: "Produto removido com sucesso!" })
    } catch (error) {
        res.status(404).json({ msg: "Ocorreu um erro inesperado!" })
    }

}
)



// Credenciais do banco de dados (vindas do .env)
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

// Tenta se conectar ao banco. Se conseguir abre a porta, se não printa o erro
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.kthlt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(process.env.PORT || 3001);
        console.log("Conectou ao banco com sucesso!")
    })
    .catch((error) => console.log(error))


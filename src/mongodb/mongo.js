const mongoose = require('mongoose')

const config = require("../../config.json")

module.exports = {
    async iniciarConexaoDataBase(){
        const connection = await mongoose.connect(config.mongoURI).then(() => {
            console.log("Conexão ao Database realizada com sucesso!")
        }).catch((err) => {
            console.log("Não foi possível estabelecar conexão com o Database")
        })
    },
    
    async  buscarListaGeralEmails(model){
        const instance = await model.find()
        return instance
    },
    
    async  alterarStatusValidacaoEmail(emailValidado){
        const filter = { email: emailValidado };
        const update = { isValidado: true };
    
        let doc = await MyModel.findOneAndUpdate(filter, update)
    },
    
    async  auditoriaAlterarStatusEmail(model, emailValidado){
        const filter = { email: emailValidado };
        const update = { isValidado: false };

        let doc = await model.findOneAndUpdate(filter, update)
        return doc
    }

}
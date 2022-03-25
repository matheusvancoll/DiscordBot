const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const ModelPeritas = mongoose.model('list_emails', {
    _id: ObjectId,
    id: Number,
    email: String,
    turma: Number,
    isValidado: Boolean
})

const config = require("../../config.json");

module.exports = {
    validarEntradaAlunServer(message, parametroMensagem){
        let dadosEmail = null;
        
        if(parametroMensagem[0] == "!verificar"){
            this.obterDadosPorEmail(parametroMensagem[1]).then(promis => dadosEmail = promis)
            message.reply({
                content: "Verificando email..."
            })
    
            setTimeout(function() {
                if(dadosEmail != undefined || dadosEmail != null){
                    adicionarCargoTurma(message, dadosEmail.turma)
                    alterarStatusValidacaoEmail(dadosEmail.email)
                    message.reply({
                        content: "Email: "+ dadosEmail.email +" validado com sucesso! Agora você pode ter acesso liberado!"
                    })
                }else{
                    message.reply({
                        content: "O Email: "+ parametroMensagem[1] +" não possui registro ou já foi adicionado ao servidor. Em caso de dúvia consulte o(s) ADMIN(s)"
                    })
                }
            }, 3000);
        }
    },

    auditoriaConsultarEmailValidado(message, parametroMensagem){
        if(parametroMensagem[0] == "!auditoria_consultar"){
            this.consultarAuditoriaEmail(parametroMensagem[1]).then(promis => dadosEmail = promis)
            message.reply({
                content: "Verificando Email..."
            })
    
            setTimeout(function() {
                if(dadosEmail != null){
                    if(dadosEmail.isValidado){
                        message.reply({
                            content: "O email: "+ dadosEmail.email +" já foi validado!"
                        })
                    }else{
                        if(!dadosEmail.isValidado){
                            message.reply({
                                content: "O email: "+ dadosEmail.email +" ainda não entrou foi validado"
                            })
                        }else{
                            message.reply({
                                content: "O email: "+ parametroMensagem[1] +" não possui registro"
                            })
                        }
                    }
                }else{
                    message.reply({
                        content: "Não conseguimos localizar o email"
                    })
                }
            }, 3000);
        }
    },

    auditoriaLiberarEmailValidado(message, parametroMensagem){
        if(parametroMensagem[0] == "!auditoria_liberar"){
            this.consultarAuditoriaEmail(parametroMensagem[1]).then(promis => dadosEmail = promis)
            message.reply({
                content: "Consultando liberação..."
            })
    
            setTimeout(function() {
                if(dadosEmail != null){
                    if(dadosEmail.isValidado){
                        auditoriaAlterarStatusEmail(dadosEmail.email).then(promis => teste = promis)
                        message.reply({
                            content: "Email: "+ dadosEmail.email +" liberado com sucesso! Será necessário solicitar novamente a verificação no canal de verificacao-inicial"
                        })
                    }else{
                        if(!dadosEmail.isValidado){
                            message.reply({
                                content: "O Email: "+ dadosEmail.email +" já se encontra liberado"
                            })
                        }else{
                            message.reply({
                                content: "Ooops não consegui localizar o email: "+ parametroMensagem[1]
                            })
                        }
                    }
                }else{
                    message.reply({
                        content: "Não conseguimos localizar o email"
                    })
                }
            }, 3000);
        }
    },

    async obterDadosPorEmail(emailParam){
        let emails = await this.buscarListaGeralEmails()
    
        for (let i = 0; i< emails.length; i++) {
            if(emailParam == emails[i].email){
                if(emails[i].isValidado){
                    return null
                }else{
                    return emails[i]
                }
            }
        }
        return null
    },

    async buscarListaGeralEmails(){
        const instance = await ModelPeritas.find()
        return instance
    },

    async consultarAuditoriaEmail(emailParam){
        let emails = await this.buscarListaGeralEmails()
    
        for (let i = 0; i< emails.length; i++) {
            if(emailParam == emails[i].email){
                return emails[i]
            }
        }
        return null
    }
}

function adicionarCargoTurma(message, turma){
    let tag_alun = config.tag_Alun
    let tag_turma_3 = config.tag_Turma3
    let tag_turma_4 = config.tag_Turma4
    let tag_turma_5 = config.tag_Turma5
    let tag_turma_6 = config.tag_Turma6
    let tag_turma_7 = config.tag_Turma7

    if(turma == 3){ message.member.roles.add(tag_turma_3) }
    if(turma == 4){ message.member.roles.add(tag_turma_4) }
    if(turma == 5){ message.member.roles.add(tag_turma_5) }
    if(turma == 6){ message.member.roles.add(tag_turma_6) }
    if(turma == 7){ message.member.roles.add(tag_turma_7) }
    
    message.member.roles.add(tag_alun)
}

async function alterarStatusValidacaoEmail(emailValidado){
    const filter = { email: emailValidado };
    const update = { isValidado: true };

    let doc = await ModelPeritas.findOneAndUpdate(filter, update)
}

async function auditoriaAlterarStatusEmail(emailValidado){
    const filter = { email: emailValidado };
    const update = { isValidado: false };

    let doc = await ModelPeritas.findOneAndUpdate(filter, update)
    return doc
}
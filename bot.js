const mongoose = require('mongoose')
const Discord = require("discord.js")
const { Intents } = require("discord.js")

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const MyModel = mongoose.model('list_emails', {
    _id: ObjectId,
    id: Number,
    email: String,
    turma: Number,
    isValidado: Boolean
})

const client = new Discord.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
})

const config = require("./config.json");
client.login(config.token)


//--------------------------------------------------------------------------------------------//
//Bot
//--------------------------------------------------------------------------------------------//
client.on("ready", () => {
    console.log("BOT ON!")
    iniciarConexaoDataBase()
})

//Add Member
client.on("guildMemberAdd", (member) => {
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.id == config.channelId)
    welcomeChannel.send(`Olá ${member.user}! - Bem vindo ao .........................`) //chanel
    member.send("Bem vindo!") //privado
})

//Verificação de Mensagens
client.on("messageCreate", (message) => {
    let mensagemConteudo = message.content
    let conteudoSplit = mensagemConteudo.split(' ')
    let dadosEmail = null;

    //Verificar de Email
    if(message.channel.id == config.channelId){
        if(conteudoSplit[0] == "!verificar"){
            obterDadosPorEmail(conteudoSplit[1]).then(promis => dadosEmail = promis)
    
            message.reply({
                content: "Verificando Email..."
            })
    
            setTimeout(function() {
                if(dadosEmail != undefined || dadosEmail != null){
                    adicionarCargoTurma(message, dadosEmail.turma)
                    alterarStatusValidacaoEmail(conteudoSplit[1])
                    message.reply({
                        content: "Email: "+ dadosEmail.email +" validado com sucesso! Agora você pode ter acesso liberado!"
                    })
                }else{
                    message.reply({
                        content: "O Email: "+ conteudoSplit[1] +" não possui registro ou já foi adicionado ao servidor. Em caso de dúvia consulte o(s) ADMIN(s)"
                    })
                }
            }, 3000);
        }
    }


    //Auditoria consulta email
    if(message.channel.id == config.channelAuditoriaID){
        if(conteudoSplit[0] == "!auditoria_consultar"){
            consultarAuditoriaEmail(conteudoSplit[1]).then(promis => dadosEmail = promis)
            message.reply({
                content: "Verificando Email..."
            })
    
            setTimeout(function() {
                if(dadosEmail != null){
                    if(dadosEmail.isValidado){
                        message.reply({
                            content: "Email: "+ dadosEmail.email +" já foi validado!"
                        })
                    }else{
                        if(!dadosEmail.isValidado){
                            message.reply({
                                content: "O Email: "+ dadosEmail.email +" ainda não entrou no servidor"
                            })
                        }else{
                            message.reply({
                                content: "O Email: "+ conteudoSplit[1] +" não possui registro"
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
    }


    //Auditoria liberar email manual
    if(message.channel.id == config.channelAuditoriaID){
        if(conteudoSplit[0] == "!auditoria_liberar"){
            consultarAuditoriaEmail(conteudoSplit[1]).then(promis => dadosEmail = promis)
            
            message.reply({
                content: "Consultando liberação..."
            })
    
            setTimeout(function() {
                if(dadosEmail != null){
                    if(dadosEmail.isValidado){
                        console.log("TRUE")
        
                        //altera o status para false
                        auditoriaAlterarStatusEmail(dadosEmail.email)
        
                        message.reply({
                            content: "Email: "+ dadosEmail.email +" liberado com sucesso! Será necessário solicitar novamente a verificação no canal de verificacao-inicial"
                        })
                    }else{
                        if(!dadosEmail.isValidado){
                            console.log("FALSE")
                            message.reply({
                                content: "O Email: "+ dadosEmail.email +" já se encontra liberado"
                            })
                        }else{
                            message.reply({
                                content: "Ooops não consegui localizar o email: "+ conteudoSplit[1]
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
    }
})


//--------------------------------------------------------------------------------------------//
//Validação de Emails
//--------------------------------------------------------------------------------------------//
async function obterDadosPorEmail(emailParam){
    let emails = await buscarListaGeralEmails()

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
}

async function adicionarCargoTurma(message, turma){
    let tag_alun = config.tag_Alun
    let tag_turma_4 = config.tag_Turma4
    let tag_turma_5 = config.tag_Turma5
    let tag_turma_6 = config.tag_Turma6
    let tag_turma_7 = config.tag_Turma7

    if(turma == 4){ message.member.roles.add(tag_turma_4) }
    if(turma == 5){ message.member.roles.add(tag_turma_5) }
    if(turma == 6){ message.member.roles.add(tag_turma_6) }
    if(turma == 7){ message.member.roles.add(tag_turma_7) }
    
    message.member.roles.add(tag_alun)
}

async function consultarAuditoriaEmail(emailParam){
    let emails = await buscarListaGeralEmails()

    for (let i = 0; i< emails.length; i++) {
        if(emailParam == emails[i].email){
            return emails[i]
        }
    }
    return null
}


//--------------------------------------------------------------------------------------------//
// Operações no banco de dados
//--------------------------------------------------------------------------------------------//

async function iniciarConexaoDataBase(){
    const connection = await mongoose.connect('!').then(() => {
        console.log("Conexão ao Database realizada com sucesso!")
    }).catch((err) => {
        console.log("Não foi possível estabelecar conexão com o Database")
    })
}

async function buscarListaGeralEmails(){
    const instance = await MyModel.find()
    return instance
}

async function alterarStatusValidacaoEmail(emailValidado){
    const filter = { email: emailValidado };
    const update = { isValidado: true };

    let doc = await MyModel.findOneAndUpdate(filter, update)
}

async function auditoriaAlterarStatusEmail(emailValidado){
    const filter = { email: emailValidado };
    const update = { isValidado: false };

    let doc = await MyModel.findOneAndUpdate(filter, update)
    return doc
}


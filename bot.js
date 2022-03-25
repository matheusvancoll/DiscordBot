const Discord = require("discord.js")
const { Intents } = require("discord.js")

const client = new Discord.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
})

const config = require("./config.json");
const serverPeritas = require('./src/servidores/peritasQueLucram')
const serverPericia = require('./src/servidores/elementoPericia')
const databaseMongo = require('./src/mongodb/mongo')

client.login(config.token)


//--------------------------------------------------------------------------------------------//
//Bot
//--------------------------------------------------------------------------------------------//
client.on("ready", () => {
    console.log("BOT ON!")
    databaseMongo.iniciarConexaoDataBase()
})


//Verificação de Mensagens
client.on("messageCreate", (message) => {
    let mensagemConteudo = message.content
    let parametroMensagem = mensagemConteudo.split(' ')

    if(message.channel.id == config.idChannelGeral_peritas){ serverPeritas.validarEntradaAlunServer(message, parametroMensagem) } //Verificar entrada - Peritas
    if(message.channel.id == config.idChannelAuditoria_peritas){ 
        if(parametroMensagem[0] == "!auditoria_consultar") {serverPeritas.auditoriaConsultarEmailValidado(message, parametroMensagem) } //Auditoria consulta - Peritas
        if(parametroMensagem[0] == "!auditoria_liberar") { serverPeritas.auditoriaLiberarEmailValidado(message, parametroMensagem) }    //Auditoria liberar - Peritas
    }


    if(message.channel.id == config.idChannelGeral_pericia){ serverPericia.validarEntradaAlunServer(message, parametroMensagem) } //Verificar entrada - Pericia
    if(message.channel.id == config.idChannelAuditoria_pericia){
        if(parametroMensagem[0] == "!auditoria_consultar") { serverPericia.auditoriaConsultarEmailValidado(message, parametroMensagem) } //Auditoria consultar - Pericia
        if(parametroMensagem[0] == "!auditoria_liberar") { serverPericia.auditoriaLiberarEmailValidado(message, parametroMensagem) }     //Auditoria liberar - Pericia
    }


})

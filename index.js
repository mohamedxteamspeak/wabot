"use strict";
const { default: makeWASocket, BufferJSON, initInMemoryKeyStore, DisconnectReason, AnyMessageContent, useMultiFileAuthState, delay, generateWAMessageFromContent, downloadContentFromMessage } = require("@adiwajshing/baileys")
const figlet = require("figlet");
const fs = require("fs");
const moment = require('moment')
const chalk = require('chalk')
const logg = require('pino')
const clui = require('clui')
const { Spinner } = clui
const { serialize } = require("./lib/myfunc");
const { color, mylog, infolog } = require("./lib/color");
const time = moment(new Date()).format('HH:mm:ss DD/MM/YYYY')
let setting = JSON.parse(fs.readFileSync('./config.json'));
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
	organization: setting.ORG_KEY,
	apiKey: setting.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

function title() {
      console.clear()
	  console.log(chalk.bold.green(figlet.textSync('Bot OpenAI', {
		font: 'Standard',
		horizontalLayout: 'default',
		verticalLayout: 'default',
		width: 80,
		whitespaceBreak: false
	})))
	console.log(chalk.yellow(`\n              ${chalk.yellow('[ Created By L3FIT ]')}\n\n${chalk.red('Bot OpenAI')} : ${chalk.white('WhatsApp Bot OpenAI')}\n${chalk.red('Follow Insta Dev')} : ${chalk.white('@dolipran_009')}\n${chalk.red('Message Me On WhatsApp')} : ${chalk.white('+212 679713244')}\n`))
}

/**
* Uncache if there is file change;
* @param {string} module Module name or path;
* @param {function} cb <optional> ;
*/
function nocache(module, cb = () => { }) {
	fs.watchFile(require.resolve(module), async () => {
		await uncache(require.resolve(module))
		cb(module)
	})
}
/**
* Uncache a module
* @param {string} module Module name or path;
*/
function uncache(module = '.') {
	return new Promise((resolve, reject) => {
		try {
			delete require.cache[require.resolve(module)]
			resolve()
		} catch (e) {
			reject(e)
		}
	})
}

const status = new Spinner(chalk.cyan(` Booting WhatsApp Bot`))
const starting = new Spinner(chalk.cyan(` Preparing After Connect`))
const reconnect = new Spinner(chalk.redBright(` Reconnecting WhatsApp Bot`))

async function fanStart() {
const connectToWhatsApp = async () => {
	const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
	const conn = makeWASocket({
        printQRInTerminal: true,
        logger: logg({ level: 'fatal' }),
        auth: state,
	patchMessageBeforeSending: (message) => {
        const requiresPatch = !!( message.buttonsMessage || message.templateMessage || message.listMessage );
        if (requiresPatch) { message = { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {}, }, ...message, },},};}
        return message;},	
        browser: ["OpenAI BOT", "Safari", "3.0"],
	getMessage: async key => {
            return {
                
            }
        }
    })
	title()
	
	/* Auto Update */
	require('./lib/myfunc')
	require('./message/msg')
	nocache('./lib/myfunc', module => console.log(chalk.greenBright('[ WHATSAPP BOT ]  ') + time + chalk.cyanBright(` "${module}" تم تحديثه!`)))
	nocache('./message/msg', module => console.log(chalk.greenBright('[ WHATSAPP BOT ]  ') + time + chalk.cyanBright(` "${module}" تم تحديثه!`)))
	
	conn.multi = true
	conn.nopref = false
	conn.prefa = 'anjing'
	conn.ev.on('messages.upsert', async m => {
		if (!m.messages) return;
		var msg = m.messages[0]
		try { if (msg.message.messageContextInfo) delete msg.message.messageContextInfo } catch { }
		msg = serialize(conn, msg)
		msg.isBaileys = msg.key.id.startsWith('BAE5')
		require('./message/msg')(conn, msg, m, openai)
	})
	conn.ev.on('connection.update', (update) => {
          if (global.qr !== update.qr) {
           global.qr = update.qr
          }
          const { connection, lastDisconnect } = update
            if (connection === 'close') {
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connectToWhatsApp() : console.log('connection logged out...')
            }
            if (update.qr != 0 && update.qr != undefined) {
                console.log(chalk.yellow('🚩ㅤEscanea este codigo QR, el codigo QR expira en 60 segundos.'))
            }
            if (connection == 'open') {
                console.log(chalk.yellow('❧ البوت شغال ويعمل بشكل جيد ✅\n'))
            }        
            })
	conn.ev.on('creds.update', await saveCreds)

	conn.reply = (from, content, msg) => conn.sendMessage(from, { text: content }, { quoted: msg })
    
	conn.sendMessageFromContent = async(jid, message, options = {}) => {
		var option = { contextInfo: {}, ...options }
		var prepare = await generateWAMessageFromContent(jid, message, option)
		await conn.relayMessage(jid, prepare.message, { messageId: prepare.key.id })
		return prepare
	 }
	
	 conn.downloadAndSaveMediaMessage = async(msg, type_file, path_file) => {
		if (type_file === 'image') {
		var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
		let buffer = Buffer.from([])
		for await(const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(path_file, buffer)
		return path_file
		} else if (type_file === 'video') {
		var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
		let buffer = Buffer.from([])
		for await(const chunk of stream) {
		  buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(path_file, buffer)
		return path_file
		} else if (type_file === 'sticker') {
		var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
		let buffer = Buffer.from([])
		for await(const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(path_file, buffer)
		return path_file
		} else if (type_file === 'audio') {
		var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
		let buffer = Buffer.from([])
		for await(const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(path_file, buffer)
		return path_file
		}
		}
		conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
			let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
			let buffer
			if (options && (options.packname || options.author)) {
			buffer = await writeExifImg(buff, options)
			} else {
			buffer = await imageToWebp(buff)
			}
			await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
			.then( response => {
			fs.unlinkSync(buffer)
			return response
			})
			}
	
	return conn
}

connectToWhatsApp()
.catch(err => console.log(err))
}

fanStart()

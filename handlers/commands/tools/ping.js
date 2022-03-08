const { processTime, humanFileSize } = require("../../../utils")
const fs = require('fs')
let mulai = fs.statSync('./src/start.txt')
let package = require('../../../package.json')
const os = require('os')
let { info } = require("../../../db")
let { stats } = info('stats')

module.exports = {
    tags: ['others', 'information'],
    cmd: ['ping', 'stat'],
    help: ['ping'],
    exec: (m, client, { prefix }) => {
        mtime = new Date(mulai.mtime)
        now = new Date()
        let text = `💻 *Bot Information*
• Bot Status : 🟢 Online
• Latency : ${processTime(client.timestamp, moment())} _ms_
• Bot Run Time : ${moment.duration((now - mtime) / 1000, 'seconds').humanize()}
• OS Up Time : ${moment.duration(os.uptime(), 'seconds').humanize()}

🌡 *${package.name} Statistics* :
- Message Received : ${stats.msgRecv}
- Message Sent : ${stats.msgSent}
- Command HIT : ${stats.cmd}
- Downloaded Link : ${stats.autodownload}
- Stickers Created : ${stats.sticker}
- Filesize Sent : ${humanFileSize(stats.filesize, true)}
`
        const btn = [
            { quickReplyButton: { displayText: `🧪 Features`, id: `${prefix}menu` } },
            { quickReplyButton: { displayText: `🧪 Group Bot`, id: `${prefix}groupbot` } },
            { urlButton: { displayText: `🎨 Instagram`, url: `https://www.instagram.com/mg.bot` } },
        ]
        client.sendMessage(m.chat, { text, footer: global.footer, templateButtons: btn }, { quoted: m })
    }
}
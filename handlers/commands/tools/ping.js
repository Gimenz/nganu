const { processTime } = require("../../../utils")
const fs = require('fs')
let mulai = fs.statSync('./src/start.txt')
const os = require('os')
let date = moment.duration(moment(moment()).diff(mulai))

module.exports = {
    tags: ['others', 'information'],
    cmd: ['ping', 'stat'],
    help: ['ping'],
    exec: (m, client, { prefix }) => {
        let text = `💻 *Bot Information*
• Bot Status : 🟢 Online
• Latency : ${processTime(client.timestamp, moment())} _ms_
• Bot Run Time : ${moment.duration(mulai.mtimeMs, 'milliseconds').humanize()}
• System Up Time : ${moment.duration(os.uptime(), 'seconds').humanize()}
`
        const btn = [
            { quickReplyButton: { displayText: `🧪 Features`, id: `${prefix}menu` } },
            { quickReplyButton: { displayText: `🧪 Group Bot`, id: `${prefix}groupbot` } },
            { urlButton: { displayText: `🎨 Instagram`, url: `https://www.instagram.com/mg.bot` } },
        ]
        client.sendMessage(m.chat, { text, footer, templateButtons: btn }, { quoted: m })
    }
}
const { S_WHATSAPP_NET, delay } = require("@adiwajshing/baileys")
const package = require('../../../package.json')
const config = require('../../../src/config.json')

module.exports = {
    tags: ['others', 'information'],
    cmd: ['owner', 'creator'],
    help: ['owner'],
    exec: async (m, client) => {
        config.owner.map(async (v) => await client.sendContact(m.chat, v.split(S_WHATSAPP_NET)[0], package.author, m))
        await delay(2000)
        const btn = [
            { urlButton: { displayText: `🌐 Web`, url: `https://masgimenz.my.id` } },
            { urlButton: { displayText: `📸 Instagram`, url: `https://www.instagram.com/gimenz.id` } },
            { urlButton: { displayText: `🐈 Github`, url: `https://github.com/Gimenz` } },
            { urlButton: { displayText: `🎨 TikTok`, url: `https://www.tiktok.com/@gh0stp0w3r` } },
        ]
        client.sendMessage(m.chat, { text: `Social Media`, footer: global.footer, templateButtons: btn }, { quoted: m })
    }
}
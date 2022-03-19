const { delay, isJidGroup } = require("@adiwajshing/baileys")
const fs = require('fs')

let chatsJid = require('../../../db/usersJid.json')//JSON.parse(fs.readFileSync('../../db/usersJid.json', 'utf-8'))

module.exports = {
    tags: ['owner'],
    cmd: ['bc'],
    args: ['msg'],
    help: ['bc'],
    owner: true,
    exec: async (m, client, { args }) => {
        try {
            if (/image|video/i.test(m.quoted ? m.quoted.mtype : m.mtype) && args.length < 1) return m.reply('text nya mana?')
            m.reply(`sending broadcast message to *${chatsJid.length}* chats, estimated ${Math.floor((5 * chatsJid.length) / 60)} minutes done.`)
            if (/image|video|audio|sticker/i.test(m.quoted ? m.quoted.mtype : m.mtype)) {
                //const buff = await downloadMediaMessage(m.quoted ? m.quoted : m.message.imageMessage)
                for (let v of chatsJid) {
                    await delay(5000)
                    let ms = m.quoted ? m.getQuotedObj() : m
                    await client.copyNForward(v, client.cMod(v, ms, `📢 *Mg Bot Broadcast*\n\n${args.join(' ')}\n\n#${chatsJid.indexOf(v) + 1}`, client.user.id), true)
                }
                m.reply(`Broadcasted to *${chatsJid.length}* chats`)
            } else {
                for (let v of chatsJid) {
                    await delay(5000)
                    await client.sendMessage(v, { text: `📢 *Mg Bot Broadcast*\n\n${args.join(' ')}\n\n#${chatsJid.indexOf(v) + 1}` }, { sendEphemeral: true })
                }
                m.reply(`Broadcasted to *${chatsJid.length}* chats`)
            }
        } catch (error) {
            console.log(error);
        }
    }
}
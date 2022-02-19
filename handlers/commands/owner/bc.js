const { delay } = require("@adiwajshing/baileys")

let chatsJid = JSON.parse(fs.readFileSync('../../../db/chatsJid.json', 'utf-8'))

module.exports = {
    tags: ['owner'],
    cmd: ['bc'],
    args: ['msg'],
    help: ['bc'],
    owner: true,
    exec: async (m, client, { args }) => {
        try {
            if (args.length < 1) return mreply('text nya mana?')
            m.reply(`sending broadcast message to *${chatsJid.length}* chats, estimated ${Math.floor((5 * chatsJid.length) / 60)} minutes done.`)
            if (isMedia || /image|video/i.test(m.quoted ? m.quoted.mtype : m.mtype)) {
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
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
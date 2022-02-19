const { jidDecode } = require("@adiwajshing/baileys")

module.exports = {
    tags: ['groups'],
    cmd: ['all', 'tagall', 'hidetag'],
    help: ['all', 'tagall', 'hidetag'],
    group: true,
    botAdmin: false,
    admin: true,
    exec: async (m, client, { cmd, args }) => {
        try {
            const groupMembers = (await client.groupMetadata(m.chat)).participants
            if (cmd == 'hidetag') {
                let text = args.join(' ')
                if (!text) return m.reply('textnya mana?')
                client.sendMessage(m.chat, { text, mentions: groupMembers.map(x => x.id) })
            } else {
                text = args.length >= 1 ? `${args.join(' ')}\n\n` : '*Tag All Members*\n\n'
                n = 1
                for (let i of groupMembers) {
                    text += `*_${n}_.* @${jidDecode(i.id).user}`
                    n++
                }
                client.sendMessage(m.chat, { text, mentions: groupMembers.map(x => x.id) })
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
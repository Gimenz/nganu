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
            let type = m.quoted ? m.quoted.mtype : m.mtype
            if (cmd == 'hidetag') {
                let text = args.join(' ')
                if (/image|video|audio|sticker/i.test(type)) {
                    let ms = m.quoted ? m.getQuotedObj() : m
                    await client.copyNForward(m.chat, client.cMod(m.chat, ms, text, client.user.id), true, { mentions: groupMembers.map(x => x.id) })
                } else {
                    client.sendMessage(m.chat, { text, mentions: groupMembers.map(x => x.id) })
                }
            } else {
                text = args.length >= 1 ? `@${jidDecode(m.sender).user} : ${args.join(' ')}\n` : '*Tag All Members*\n'
                n = 1
                for (let i of groupMembers) {
                    text += `\n*_${n}_.* @${jidDecode(i.id).user}`
                    n++
                }

                if (/image|video/i.test(type)) {
                    let ms = m.quoted ? m.getQuotedObj() : m
                    await client.copyNForward(m.chat, client.cMod(m.chat, ms, text, client.user.id), true, { mentions: groupMembers.map(x => x.id) })
                } else {
                    client.sendMessage(m.chat, { text, mentions: groupMembers.map(x => x.id) })
                }

            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
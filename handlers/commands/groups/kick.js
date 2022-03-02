const { delay } = require("@adiwajshing/baileys");
const { parseMention } = require("../../../lib/function");

module.exports = {
    cmd: ['kick'],
    help: ['kick'],
    startsWith: ['-'],
    args: ['@user, @user', 'reply msg'],
    tags: ['groups'],
    group: true,
    botAdmin: true,
    admin: true,
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            if (m.quoted) {
                const _user = m.quoted.sender;
                await client.groupParticipantsUpdate(m.chat, [_user], 'remove')
            } else if (args.length >= 1 || m.mentionedJid.length >= 1) {
                let _participants = parseMention(args.join(' '))
                if (_participants.length < 1) return m.reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd ? cmd : ''} @user`)
                m.reply(`Kick/Remove *${_participants.length}* group members within delay 3 seconds to prevent banned`)
                for (let usr of _participants) {
                    await delay(3000)
                    await client.groupParticipantsUpdate(m.chat, [usr], 'remove')
                }
            } else {
                m.reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd ? cmd : ''} @user`)
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
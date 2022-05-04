const { AFK } = require("../../../db")

module.exports = {
    tags: ['groups'],
    cmd: ['afk'],
    help: ['afk'],
    group: true,
    exec: async (m, client, { cmd, args, formattedTitle }) => {
        try {
            const isAfk = AFK.check(m.sender, m.chat)
            if (isAfk) {
                if (args.length > 1) {
                    AFK.update(m.sender, m.chat, moment(), args.join(' '))
                    m.reply(`✅ ${m.pushName} Sekarang AFK!!`, m.chat)
                } else {
                    AFK.update(m.sender, m.chat, moment(), '-')
                    m.reply(`✅ ${m.pushName} Sekarang AFK!!`, m.chat)
                }
            } else {
                if (args.length > 1) {
                    AFK.add(m.sender, m.chat, formattedTitle, moment(), args.join(' '))
                    m.reply(`✅ ${m.pushName} Sekarang AFK!!`, m.chat)
                } else {
                    AFK.add(m.sender, m.chat, formattedTitle, moment(), '-')
                    m.reply(`✅ ${m.pushName} Sekarang AFK!!`, m.chat)
                }
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
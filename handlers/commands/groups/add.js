const { formatPhone } = require("../../../utils")

module.exports = {
    cmd: ['add'],
    startsWith: ['+'],
    help: ['add'],
    args: ['628xxx, 628xxx, 628xxx'],
    tags: ['groups'],
    group: true,
    botAdmin: true,
    admin: true,
    exec: async (m, client, { prefix, cmd, args }) => {
        if (args.length < 1) return m.reply(`example: ${prefix + cmd ? cmd : ''} 628xxx, +6285-2335-xxxx, 085236xxx`)
        try {
            let _participants = args.join(' ').split`,`.map(v => formatPhone(v.replace(/[^0-9]/g, '')))
            let users = (await Promise.all(
                _participants.filter(async x => {
                    (await client.onWhatsApp(x)).map(x => x.exists)
                }))
            )
            await client.groupParticipantsUpdate(m.chat, users, 'add').then(res => console.log(res)).catch(e => console.log(e))
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
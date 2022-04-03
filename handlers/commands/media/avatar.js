const { isJidGroup } = require("@adiwajshing/baileys")
const { formatPhone } = require("../../../utils")

module.exports = {
    cmd: ['ava', 'avatar', 'getpp'],
    help: ['ava'],
    args: ['628xxx, @user'],
    tags: ['media'],
    exec: async (m, client, { prefix, cmd, args }) => {
        if ((!m.quoted && args.length < 1)) return m.reply(`example: ${prefix + cmd} ${isJidGroup(m.chat) ? ' @user' : '628xxx'}`)
        try {
            let _participants = m.quoted ? m.quoted.sender : formatPhone(args.join(' ').replace(/[^0-9]/g, ''))
            let { exists, jid } = (await client.onWhatsApp(_participants))[0]
            if (exists) {
                const img = await client.profilePictureUrl(jid)
                client.sendFileFromUrl(m.chat, img)
            }
        } catch (error) {
            m.reply('no picture/private')
            console.log(error);
        }
    }
}
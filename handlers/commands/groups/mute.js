const { groupManage } = require("../../../db")

module.exports = {
    cmd: ['mute', 'off'],
    help: ['mute'],
    tags: ['groups'],
    group: true,
    botAdmin: false,
    admin: true,
    groupMuteAllowed: true,
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            let json = groupManage.get(m.chat);
            if (json.mute) return m.reply('❌ Bot sudah off di group ini')
            json.mute = true
            groupManage.update(m.chat, json)
            m.reply('❌ Bot telah di nonaktifkan di group ini')
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
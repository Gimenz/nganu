const { groupManage } = require("../../../db")

module.exports = {
    cmd: ['unmute', 'on'],
    help: ['unmute'],
    tags: ['groups'],
    group: true,
    botAdmin: false,
    admin: true,
    groupMuteAllowed: true,
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            let json = groupManage.get(m.chat);
            if (!json.mute) return m.reply('✅ Bot sudah Aktif di group ini')
            json.mute = false
            groupManage.update(m.chat, json)
            m.reply('✅ Bot telah di aktifkan di group ini')
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
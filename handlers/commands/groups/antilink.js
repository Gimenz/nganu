const { groupManage } = require("../../../db")

module.exports = {
    cmd: ['setantilink'],
    help: ['setantilink'],
    args: ['msg', 'on', 'off'],
    tags: ['groups'],
    group: true,
    botAdmin: false,
    admin: true,
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            let json = groupManage.get(m.chat);
            if (args[0] == 'on') {
                if (json.antilink) return m.reply('antilink sudah aktif sebelumnya ✅')
                json.antilink = true
                groupManage.update(m.chat, json)
                m.reply('antilink telah diaktifkan ✅')
            } else if (args[0] == 'off') {
                if (!json.antilink) return m.reply('antilink sudah off sebelumnya ❌')
                json.antilink = false
                groupManage.update(m.chat, json)
                m.reply('antilink telah Non-aktifkan ✅')
            } else {
                m.reply(`Pilih on/off, contoh: .antilink off`)
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
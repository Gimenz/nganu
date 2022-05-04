const { groupManage } = require("../../../db")

module.exports = {
    cmd: ['setleave', 'setleft', 'leave'],
    help: ['setleave'],
    args: ['msg', 'on', 'off'],
    tags: ['groups'],
    group: true,
    botAdmin: false,
    admin: true,
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            let json = groupManage.get(m.chat);
            if (args[0] == 'on') {
                if (json.leave.status) return m.reply('leave sudah aktif sebelumnya ✅')
                json.leave.status = true
                groupManage.update(m.chat, json)
                m.reply('leave Message telah diaktifkan dengan msg: \n' + json.leave.msg)
            } else if (args[0] == 'off') {
                if (!json.leave.status) return m.reply('leave sudah off sebelumnya ❌')
                json.leave.status = false
                groupManage.update(m.chat, json)
                m.reply('leave Message telah Non-aktifkan')
            } else if (args[0] == 'msg') {
                const q = args.slice(1).join(' ')
                if (!q) return m.reply(`pesan diperlukan, contoh: ${prefix + cmd} msg sugeng rawuh @user wonten ing group {title}`)
                json.leave.msg = q
                groupManage.update(m.chat, json)
                m.reply('leave Message telah diubah ke : \n' + q)
            } else {
                m.reply(`Custom pesan leave untuk menyambut member yang baru join!
*Penggunaan :*
• ${prefix}setleave <msg|on|off>
• msg <custom leave> : set pesan leave
• on : mengaktifkan
• off : menonaktifkan

*Format :*
• @user : pesan dengan tag (selamat jalan @user)
• {title} : pesan dengan nama grup (seseorang telah keluar dari grup *Title*)
• {foto} : pesan dengan foto

*Contoh :*
• ${prefix}setleave msg sugeng tindak @user sangking group {title}, mugi tansah pinaringan sehat {foto}`)
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
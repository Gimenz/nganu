const { groupManage } = require("../../../db")
const { formatPhone } = require("../../../utils")

module.exports = {
    cmd: ['setwelcome'],
    help: ['setwelcome'],
    args: ['msg', 'on', 'off'],
    tags: ['groups'],
    group: true,
    botAdmin: false,
    admin: true,
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            let json = groupManage.get(m.chat);
            if (args[0] == 'on') {
                if (json.welcome.status) return m.reply('welcome sudah aktif sebelumnya ✅')
                json.welcome.status = true
                groupManage.update(m.chat, json)
                m.reply('Welcome Message telah diaktifkan dengan msg: \n' + json.welcome.msg)
            } else if (args[0] == 'off') {
                if (!json.welcome.status) return m.reply('welcome sudah off sebelumnya ❌')
                json.welcome.status = false
                groupManage.update(m.chat, json)
                m.reply('Welcome Message telah Non-aktifkan')
            } else if (args[0] == 'msg') {
                const q = args.slice(1).join(' ')
                if (!q) return m.reply(`pesan diperlukan, contoh: ${prefix + cmd} msg sugeng rawuh @user wonten ing group {title}`)
                json.welcome.msg = q
                groupManage.update(m.chat, json)
                m.reply('Welcome Message telah diubah ke : \n' + q)
            } else {
                m.reply(`Custom pesan welcome untuk menyambut member yang baru join!
*Penggunaan :*
• ${prefix}setwelcome <msg|on|off>
• msg <custom welcome> : set pesan welcome
• on : mengaktifkan
• off : menonaktifkan

*Format :*
• @user : pesan dengan tag (selamat datang @user)
• {title} : pesan dengan nama grup (selamat datang di grup *Title*)
• {foto} : pesan dengan foto

*Contoh :*
• ${prefix}setwelcome msg Halo selamat datang @user di grup {title}, silahkan memperkenalkan diri! {foto}`)
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
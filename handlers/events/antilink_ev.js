const { delay } = require("@adiwajshing/baileys");
const { groupManage } = require("../../db");

module.exports = {
    group: true,
    botAdmin: true,
    groupEvent: true,
    exec: async (m, client, { prefix, cmd, body }) => {
        const json = groupManage.get(m.chat)
        if (json.antilink && /chat\.whatsapp\.com\/([\w\d]*)\S/g.test(body)) {
            console.log(color('[LINK GROUP]', 'red'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(body, '#f64f59'));
            const check = await client.inviteInfo(body.match(/chat\.whatsapp\.com\/([\w\d]*)/g)[1])
            if (!check) return
            if (!isBotGroupAdmin) return m.reply('Untungnya, bot bukan admin. jadi kamu ngga di kick :)')
            if (!isCmd || !isGroupAdmin || !isOwner) {
                m.reply('Maaf, Di group ini dilarang mengirimkan link group. kamu akan di kick oleh bot dalam 7 detik');
                await delay(7000).then(async () => {
                    await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                })
            }
        }
    }
}
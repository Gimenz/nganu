
module.exports = {
    tags: ['others'],
    cmd: ['del', 'delete'],
    help: ['delete'],
    exec: (m, client,) => {
        if (!m.quoted && !m.quoted.fromMe) return m.reply('reply pesan dari bot')
        client.sendMessage(from, { delete: { remoteJid: m.chat, fromMe: true, id: m.quoted.id, participant: m.quoted.sender } })
    }
}
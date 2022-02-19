const { EightD } = require("../../../lib/converter")

module.exports = {
    tags: ['tools', 'converter'],
    cmd: ['8d', 'eightd'],
    args: ['reply audio'],
    help: ['8d', 'eightd'],
    exec: async (m, client, { prefix, cmd }) => {
        try {
            let mediaType = m.quoted ? m.quoted.mtype : m.mtype
            let msg = m.quoted ? m.quoted : m
            if (/audio|video|document/i.test(mediaType)) {
                const buffer = await client.downloadMediaMessage(msg)
                const res = await EightD(buffer)
                await client.sendFile(m.chat, res, m, { audio: true })
            } else {
                m.reply(`reply a video with caption ${prefix}${cmd}`)
            }
        } catch (error) {
            console.log(error);
            m.reply('error')
        }
    }
}
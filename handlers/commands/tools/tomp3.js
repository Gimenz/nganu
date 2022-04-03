const { toAudio } = require("../../../lib/converter")

module.exports = {
    tags: ['tools', 'converter'],
    cmd: ['tomp3', 'toaudio'],
    args: ['reply/send video'],
    help: ['tomp3', 'toaudio'],
    exec: async (m, client, { prefix, args, cmd }) => {
        try {
            if (m.quoted && m.quoted.mtype === 'videoMessage') {
                const buffer = await client.downloadMediaMessage(m.quoted)
                const res = await toAudio(buffer)
                await client.sendFile(m.chat, res, m, { audio: true })
            } else if (m.mtype == 'templateButtonReplyMessage') {
                let id = tempDB.find(x => x.id == args.join(' '))
                const res = await toAudio(id.url)
                await client.sendFile(from, res, m, { document: true, mimetype: 'audio/mp3', fileName: id.title + '.mp3' })
            } else {
                m.reply(`reply a video with caption ${prefix}${cmd}`)
            }
        } catch (error) {
            console.log(error);
            m.reply('error')
        }
    }
}
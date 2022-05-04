const twit = require('../../../lib/twit')
const regex = /https?:\/\/twitter.com\/[0-9-a-zA-Z_]{1,20}\/status\/[0-9]*/g

module.exports = {
    regex,
    link: 'Twitter',
    exec: async (m, client, { body }) => {
        try {
            let url = body.match(regex)[0]
            let data = await twit.download(url)
            await m.reply(`Media from *${data.name} [@${data.username}]* ${'```'}${data.full_text}${'```'}\n\nTotal ${data.media.length} media` || '')
            for (i of data.media) {
                if (i.mediaType == 'animated_gif') {
                    await client.sendFileFromUrl(m.chat, i.mediaUrl, '', m, '', '', { gif: true })
                } else {
                    await client.sendFileFromUrl(m.chat, i.mediaUrl, '', m)
                }
            }
        } catch (error) {
            console.log(error);
            await m.reply(util.format(error))
        }
    }
}
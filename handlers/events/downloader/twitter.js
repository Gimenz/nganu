const { fetchAPI } = require("../../../utils")
const regex = /https?:\/\/twitter.com\/[0-9-a-zA-Z_]{1,20}\/status\/[0-9]*/g

module.exports = {
    regex,
    link: 'Twitter',
    exec: async (m, client, { body }) => {
        try {
            let url = body.match(regex)[0]
            let { result: data } = await fetchAPI('masgi', '/twitter/download.php?url=' + url)
            await m.reply(`Media from *${data.name} [@${data.username}]* ${quot}${data.full_text}${quot}\n\nTotal ${data.media.mediaUrl.length} ${data.media.mediaType}` || '')
            for (i of data.media.mediaUrl) {
                if (data.media.mediaType == 'animated_gif') {
                    await client.sendFileFromUrl(m.chat, i, '', m, '', '', { gif: true })
                } else {
                    await client.sendFileFromUrl(m.chat, i, '', m)
                }
            }
        } catch (error) {
            console.log(error);
            await m.reply(util.format(error))
        }
    }
}
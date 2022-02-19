const { fetchAPI } = require("../../../utils")

module.exports = {
    regex: /https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+/g,
    link: 'Facebook',
    exec: async (m, client, { body }) => {
        try {
            url = body.match(/https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+/g)[0]
            m.reply('proses')
            let data = await fetchAPI('masgi', '/facebook/?url=' + url)
            await client.sendFileFromUrl(m.chat, data.videoUrl, `*Success* - ${data.title}`, m, '', 'mp4')
        } catch (error) {
            console.log(error);
            await m.reply(util.format(error))
        }
    }
}
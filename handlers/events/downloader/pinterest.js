const { fetchAPI } = require("../../../utils")
const regex = /https?:\/\/?(www|pin|id)?\.(it|pinterest\.co(m|\.[a-z]{1,2}))\S+\//g
module.exports = {
    regex,
    link: 'Pinterest',
    exec: async (m, client, { body }) => {
        try {
            url = regex.exec(body)[0]
            m.reply('proses')
            let data = await fetchAPI('masgi', '/pinterest/download.php?url=' + url)
            let media = data.is_video ? data.videos.video_list[Object.getOwnPropertyNames(data.videos.video_list)[0]] : data.images.orig
            await client.sendFileFromUrl(m.chat, media.url, `*${data.title || data.closeup_unified_title}* - Posted at ${moment(data.created_at).format('DD/MM/YY HH:mm:ss')}`, m)
        } catch (error) {
            console.log(error);
            await m.reply(util.format(error))
        }
    }
}
require('dotenv').config()
const { igApi } = require("insta-fetcher");
let ig = new igApi(process.env.session_id)
let storyRegExp = new RegExp(/https:\/\/(www\.)?instagram\.com\/stories\/.+/g)

module.exports = {
    regex: storyRegExp,
    link: 'IG Stories',
    exec: async (m, client, { body }) => {
        try {
            m.reply('proses')
            let u = body.match(storyRegExp)[0]
            let s = u.indexOf('?') >= 0 ? u.split('?')[0] : (u.split('').pop() == '/' != true ? `${u}` : u);
            let [username, storyId] = s.split('/stories/')[1].split('/')
            const data = await ig.fetchStories(username);
            let media = data.stories.filter(x => x.id.match(storyId))
            if (media[0].type == "image") {
                await client.sendFileFromUrl(
                    m.chat, media[0].url, `_Stories from @${username}_\nTaken at : ${moment(media[0].taken_at * 1000).format('DD/MM/YY HH:mm:ss')}`, m, '', 'jpeg',
                    { height: media[0].original_height, width: media[0].original_width }
                )
            } else {
                await client.sendFileFromUrl(
                    m.chat, media[0].url, `_Stories from @${username}_\nTaken at : ${moment(media[0].taken_at * 1000).format('DD/MM/YY HH:mm:ss')}`, m, '', 'mp4',
                    { height: media[0].original_height, width: media[0].original_width }
                )
            }
        } catch (error) {
            console.log(error);
            await m.reply(util.format(error))
        }
    }
}

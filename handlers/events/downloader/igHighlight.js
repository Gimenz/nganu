require('dotenv').config()
const { default: axios } = require('axios')
const { igApi } = require("insta-fetcher");
const { statistics } = require('../../../db');
const { shrt, fetchFilesize } = require('../../../utils');
let ig = new igApi(process.env.session_id)
const Regex = /https:\/\/www\.instagram\.com\/s\/(.*?)\?story_media_id=([\w-]+)/g

module.exports = {
    regex: Regex,
    link: 'IG Highlights',
    exec: async (m, client, { body, prefix }) => {
        const link_highlight = Regex.exec(body)[0]
        try {
            const username = await axios.get(link_highlight).then(async res => {
                const { data } = await axios.get(res.request.res.responseUrl + '?__a=1')
                return data.user.username
            })

            let [, highlightId, mediaId] = /https:\/\/www\.instagram\.com\/s\/(.*?)\?story_media_id=([\w-]+)/g.exec(link_highlight)
            highlightId = Buffer.from(highlightId, 'base64').toString('binary').match(/\d+/g)[0]
            let { data } = await ig.fetchHighlights(username)
            const filterHighlight = data.filter(x => highlightId.match(x.highlights_id))[0]
            const filterReels = filterHighlight.highlights.filter(x => mediaId.match(x.media_id.match(/(\d+)/)[0]))[0]
            let id = shrt(filterHighlight.cover, { title: filterHighlight.title, highlightCover: true })
            const btnCover = [
                { quickReplyButton: { displayText: `Highlight Cover`, id: `${prefix}sendthis ${id.id}` } },
            ]
            let buttonMessage = {
                caption: `*${filterHighlight.title}* - _Highlights from https://www.instagram.com/${username}_\nTaken at : ${moment(filterReels.taken_at * 1000).format('DD/MM/YY HH:mm:ss')}`,
                footer: global.footer,
                templateButtons: btnCover,
                height: filterReels.dimensions.height,
                width: filterReels.dimensions.width
            }
            filterReels.type == 'image'
                ? buttonMessage['image'] = { url: filterReels.url }
                : buttonMessage['video'] = { url: filterReels.url }
            await client.sendMessage(m.chat, buttonMessage, { quoted: m })
            let size = await fetchFilesize(filterReels.url)
            statistics('filesize', size)
        } catch (error) {
            console.log(error);
            await m.reply(util.format(error))
        }
    }
}

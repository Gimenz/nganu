const { statistics } = require("../../../db")
const { SimpleTikApi } = require("../../../lib/tiktok")
const { isTiktokVideo, fetchAPI, formatK, shrt } = require("../../../utils")

module.exports = {
    regex: /https:\/\/.+\.tiktok.+/g,
    link: 'TikTok',
    exec: async (m, client, { body, prefix }) => {
        try {
            url = body.match(/https:\/\/.+\.tiktok.+/g)[0]
            m.reply('proses')
            const check = await isTiktokVideo(url)
            if (!check.isVideo || check.isUser) {
                const { UserModule } = await SimpleTikApi.user(check.pathname.split('@')[1])
                const user = Object.values(UserModule.users)[1]
                const stats = Object.values(UserModule.stats)[1]
                const caption = `*TikTok Profile*\n\n` +
                    `➤ *Username :* @${user.uniqueId}\n` +
                    `➤ *Nickname :* ${user.nickname}\n` +
                    `➤ *Private :* ${user.privateAccount ? '✅' : '❌'}\n` +
                    `➤ *Followers :* ${formatK(stats.followerCount)}\n` +
                    `➤ *Following :* ${formatK(stats.followingCount)}\n` +
                    `➤ *Total Hearts :* ${formatK(stats.heartCount)}\n` +
                    `➤ *Total Videos :* ${formatK(stats.videoCount)}\n` +
                    `➤ *Created on :* ${moment(user.createTime * 1000).format('DD/MM/YY HH:mm:ss')}\n` +
                    `➤ *Bio :* ${user.signature}`
                await client.sendFileFromUrl(m.chat, user.avatarLarger, caption, m)
            } else {
                const data = await fetchAPI('masgi', '/tiktok/?url=' + url)
                let { author, video, desc, music } = data.aweme_details[0]
                let caption = `*Success* - ${'Video from https://www.tiktok.com/@' + author.unique_id || ''} [${desc}]`
                let idMp3 = shrt(music.play_url.uri, { title: `${music.title}`, tiktokAudio: true })
                let idVideo = shrt(video.play_addr.url_list[1], { title: `original sound - ${author.unique_id}` })
                const btnCover = [
                    { quickReplyButton: { displayText: `Original Sound`, id: `${prefix}sendthis ${idMp3.id}` } },
                    { quickReplyButton: { displayText: `Extract Audio`, id: `${prefix}tomp3 ${idVideo.id}` } },
                    { urlButton: { displayText: `⏬ Download in Browser`, url: `idVideo.url}` } }
                ]
                let buttonMessage = {
                    caption,
                    footer,
                    templateButtons: btnCover,
                    height: video.play_addr.height,
                    width: video.play_addr.width,
                    video: { url: video.play_addr.url_list[1] }
                }
                await client.sendMessage(m.chat, buttonMessage, { quoted: m })
                statistics('filesize', video.play_addr.data_size)
            }
        } catch (error) {
            console.log(error);
            await m.reply(util.format(error))
        }
    }
}
const { cropStyle, Sticker } = require("../../../utils/sticker")
const package = require("../../../package.json")
const { Emoji } = require("../../../utils/exif")
const { isUrl } = require("../../../utils")
let { info, statistics } = require("../../../db")
let { stats } = info('stats')

module.exports = {
    tags: ['sticker', 'media'],
    flags: ['args'],
    args: ['send/reply media'],
    cmd: ['sticker', 's', 'stiker'],
    help: ['sticker'],
    exec: async (m, client, { prefix, flags, cmd, arg, body, url }) => {
        let crop = flags.find(v => cropStyle.map(x => x == v.toLowerCase()))
        let packname = /\|/i.test(body) ? arg.split('|')[0] : `${package.name} #${stats.sticker}`
        let stickerAuthor = /\|/i.test(body) ? arg.split('|')[1] : `${package.author}`
        let categories = Object.keys(Emoji).includes(arg.split('|')[2]) ? arg.split('|')[2] : 'love' || 'love'
        try {
            if (m.mtype == 'imageMessage' || m.quoted && m.quoted.mtype == 'imageMessage') {
                const message = m.quoted ? m.quoted : m
                const buff = await client.downloadMediaMessage(message)
                const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories }, crop)
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else if (m.mtype == 'videoMessage' || m.quoted && m.quoted.mtype == 'videoMessage') {
                if (m.quoted ? m.quoted.seconds > 15 : m.message.videoMessage.seconds > 15) return m.reply('too long duration, max 15 seconds')
                const message = m.quoted ? m.quoted : m
                const buff = await client.downloadMediaMessage(message)
                const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories })
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else if (m.quoted && m.quoted.mtype == 'stickerMessage' && !m.quoted.isAnimated) {
                const buff = await client.downloadMediaMessage(m.quoted)
                const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories }, crop)
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else if (isUrl(url)) {
                const data = new Sticker(url, { packname, author: stickerAuthor, packId: '', categories }, crop)
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else if (flags.find(v => v.match(/args|help/))) {
                m.reply(`*list argumen :*\n\n${cropStyle.map(x => '--' + x).join('\n')}\n\nexample : ${prefix + cmd} --circle`)
            } else {
                m.reply(`send/reply media. media is video or image\n\nexample :\n${prefix}sticker https://s.id/REl2\n${prefix}sticker send/reply media\n\nor you can add --args\n*list argumen :*\n\n${cropStyle.map(x => '--' + x).join('\n')}\n\nexample : ${prefix + cmd} --circle`)
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
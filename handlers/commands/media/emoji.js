const { cropStyle, Sticker } = require("../../../utils/sticker")
const package = require("../../../package.json")
let { info, statistics } = require("../../../db")
let { stats } = info('stats')

module.exports = {
    tags: ['sticker', 'media'],
    flags: ['style'],
    args: ['emoji'],
    cmd: ['emo', 'emoji'],
    help: ['emo', 'emoji'],
    exec: async (m, client, { flags, args, body, prefix, cmd }) => {
        try {
            let vendor = ['apple', 'google', 'samsung', 'microsoft', 'whatsapp', 'twitter', 'facebook', 'skype', 'joypixels', 'openmoji', 'emojidex', 'messenger', 'lg', 'htc', 'mozilla']
            const emojiRegex = require('emoji-regex')()
            if ([...body.matchAll(emojiRegex)].length > 1) return m.reply('hanya bisa mengkonversi 1 emoji saja')
            const res = await Sticker.emoji(args[0], flags[0])
            if (res == undefined) return m.reply(`emoji tidak tersedia\n\ncontoh style : ${prefix + cmd} --style\nlist style:\n\n--${vendor.join('\n--')}`)
            const data = new Sticker(res.url.replace('/thumbs/120/', '/thumbs/320/'), { packname: `${package.name} #${stats.sticker}`, author: package.author })
            await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
            statistics('sticker')
        } catch (error) {
            m.reply('emoji not supported, try another one.\n\nDo Note! that not all emojis are supported')
            console.log(error);
        }
    }
}
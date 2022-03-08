const { cropStyle, Sticker } = require("../../../utils/sticker")
const package = require("../../../package.json")
const _ = require('lodash')
let { info, statistics } = require("../../../db")
let { stats } = info('stats')

module.exports = {
    tags: ['sticker', 'media'],
    flags: ['img'],
    args: ['emoji1 emoji2'],
    cmd: ['mix'],
    help: ['mix'],
    exec: async (m, client, { flags, body }) => {
        try {
            const kitchen = require('../../../lib/emojikitchen')
            if (flags.find(v => v.match(/shuffle|random/))) {
                const emoji = kitchen.shuffle()
                const res = await kitchen.mix(emoji[0], emoji[1])
                const data = new Sticker(_.sample(res.results).url, { packname: `${package.name} #${stats.sticker}`, author: package.author })
                await client.sendMessage(from, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else {
                const parsed = kitchen.parseEmoji(body)
                if (parsed.length < 1) return reply('emoji not supported, try another one.\n\nDo Note! that not all emojis are supported yet')
                const res = await kitchen.mix(parsed.length == 1 ? parsed[0] : parsed[0], parsed[1])
                const img = _.sample(res.results).url
                if (flags.find(v => v.match(/image|img|i/))) {
                    await client.sendFileFromUrl(from, img, `success ${shortenerAuth ? `https://s.id/${(await sID.short(img)).link.short}` : ''}`)
                } else {
                    const data = new Sticker(img, { packname: `${package.name} #${stats.sticker}`, author: package.author })
                    await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                    statistics('sticker')
                }
            }
        } catch (error) {
            m.reply('emoji not supported, try another one.\n\nDo Note! that not all emojis are supported')
            console.log(error);
        }
    }
}
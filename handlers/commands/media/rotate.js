const { cropStyle, Sticker } = require("../../../utils/sticker")
const package = require("../../../package.json")
let { info, statistics } = require("../../../db")
let { stats } = info('stats')
const degrees = ['90', '180', '270']

module.exports = {
    tags: ['sticker', 'media'],
    args: ['send/reply media'],
    cmd: ['flip', 'flop', 'rotate'],
    help: ['flip', 'flop', 'rotate'],
    exec: async (m, client, { prefix, flags, cmd, args, body, url }) => {
        try {
            const deg = /fl(i|o)p/i.test(cmd) ? cmd : Number(args[0])
            let crop = flags.find(v => cropStyle.map(x => x == v.toLowerCase()))
            if (m.mtype == 'imageMessage' || m.quoted && m.quoted.mtype && m.quoted.mtype == 'imageMessage') {
                const message = m.quoted ? m.quoted : m
                const buff = await client.downloadMediaMessage(message)
                const data = await Sticker.rotate(buff, deg);
                await client.sendMessage(m.chat, { image: data, caption: args[0] }, { quoted: m })
            } else if (m.quoted && m.quoted.mtype == 'stickerMessage' && !m.quoted.isAnimated) {
                const buff = await client.downloadMediaMessage(m.quoted)
                const rotated = await Sticker.rotate(buff, deg);
                const data = new Sticker(rotated, { packname: `${package.name} #${stats.sticker}`, author: package.author, packId: deg }, crop)
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else {
                m.reply(`send/reply image or sticker. example :\n${prefix + cmd} degrees\n\nlist degrees :${degrees.map(x => '- ' + x).join('\n')}`)
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
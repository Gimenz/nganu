const { Sticker } = require("../../../utils/sticker")
const package = require("../../../package.json")
let { info, statistics } = require("../../../db")
let { stats } = info('stats')

module.exports = {
    tags: ['sticker', 'media'],
    args: ['text'],
    cmd: ['ttp', 'stext'],
    help: ['ttp'],
    exec: async (m, client, { prefix, flags, cmd, args, body, url }) => {
        try {
            if (args.length < 1) return m.reply(`Penggunaan: ${prefix + cmd} kaji luhut bin rojali subadar`)
            const media = Sticker.ttp(args.join(' '));
            const data = new Sticker(media, { packname: `${package.name} #${stats.sticker}`, author: package.author })
            await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
            statistics('sticker')
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
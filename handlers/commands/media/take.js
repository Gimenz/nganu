const { Sticker } = require("../../../utils/sticker")
let { info, statistics } = require("../../../db")
let { stats } = info('stats')

module.exports = {
    tags: ['sticker', 'media'],
    args: ['reply a sticker'],
    cmd: ['take'],
    help: ['take'],
    exec: async (m, client) => {
        try {
            if (m.quoted && m.quoted.mtype == 'stickerMessage') {
                const buff = await client.downloadMediaMessage(m.quoted)
                const data = new Sticker(buff, { packname: package.name, author: package.author })
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else {
                m.reply('reply a sticker')
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
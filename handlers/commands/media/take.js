const { Sticker } = require("../../../utils/sticker")
let { info, statistics } = require("../../../db")
let package = require('../../../package.json')
let { stats } = info('stats')

module.exports = {
    tags: ['sticker', 'media'],
    args: ['reply a sticker'],
    cmd: ['take'],
    help: ['take'],
    exec: async (m, client, { arg }) => {
        try {
            let pack = arg.split('|')[0]
            let author = arg.split('|')[1] || ''
            if (!pack) return m.reply('nama pack diperlukan')

            if (m.quoted && m.quoted.mtype == 'stickerMessage') {
                const buff = await client.downloadMediaMessage(m.quoted)
                const data = new Sticker(buff, { packname: pack, author: author })
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else {
                m.reply('reply sticker, contoh #take nama pack|author')
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
const { Sticker } = require("../../../utils/sticker")
const package = require("../../../package.json")
let { info, statistics } = require("../../../db")
let { stats } = info('stats')

module.exports = {
    tags: ['media'],
    args: ['doc', 'file'],
    cmd: ['removebg', 'nobg', 'rmbg'],
    help: ['nobg', 'removebg'],
    exec: async (m, client, { prefix, flags, cmd, args }) => {
        try {
            if (m.mtype == 'imageMessage' || m.quoted && m.quoted.mtype && m.quoted.mtype == 'imageMessage' || m.quoted.mtype == 'documentMessage') {
                const removed = await Sticker.removeBG(m.quoted ? await m.quoted.download() : await m.download());
                if (flags.find(v => v.match(/((doc)|ument)|file/))) {
                    await client.sendMessage(m.chat, { document: removed, fileName: sender.split('@')[0] + 'removed.png', mimetype: 'image/png', jpegThumbnail: removed }, { quoted: m })
                } else {
                    await client.sendMessage(m.chat, { image: removed, mimetype: 'image/png', caption: 'removed' }, { quoted: m })
                }
            } else if (m.quoted && m.quoted.mtype == 'stickerMessage') {
                const removed = await Sticker.simpleRemoveBg(await m.quoted.download())
                const data = new Sticker(removed, { packname: `${package.name} #${stats.sticker}`, author: package.author })
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else {
                m.reply(`send/reply image. example :\n${prefix + cmd}\n\ndocument result use --doc`)
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
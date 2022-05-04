const { Sticker } = require("../../../utils/sticker")

module.exports = {
    tags: ['sticker', 'media'],
    args: ['reply a sticker'],
    cmd: ['tovideo', 'tomp4'],
    help: ['tovideo', 'tomp4'],
    exec: async (m, client) => {
        try {
            if (m.quoted && m.quoted.mtype == 'stickerMessage' && m.quoted.isAnimated) {
                const buff = await m.quoted.download()
                const media = await Sticker.toVideo(buff)
                client.sendFileFromUrl(m.chat, media, 'converted', m);
            } else {
                m.reply('reply a sticker')
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
const { Sticker } = require("../../../utils/sticker");

module.exports = {
    tags: ['sticker', 'media'],
    args: ['reply a sticker'],
    cmd: ['extract'],
    help: ['extract'],
    exec: async (m, client) => {
        try {
            if (m.quoted && m.quoted.mtype == 'stickerMessage') {
                await client.presenceSubscribe(m.chat)
                await client.sendPresenceUpdate('composing', m.chat)
                const media = await client.downloadMediaMessage(m.quoted)
                const json = await Sticker.extract(media);
                m.reply(util.format(json))
            } else {
                m.reply('reply a sticker')
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
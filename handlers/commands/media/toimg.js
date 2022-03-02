module.exports = {
    tags: ['sticker', 'media'],
    args: ['reply a sticker'],
    cmd: ['toimg'],
    help: ['toimg'],
    exec: async (m, client) => {
        try {
            if (m.quoted && m.quoted.mtype == 'stickerMessage') {
                const media = await client.downloadMediaMessage(m.quoted)
                await client.sendMessage(m.chat, { image: media, jpegThumbnail: media }, { quoted: m })
            } else {
                m.reply('reply a sticker')
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
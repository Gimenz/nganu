const { cropStyle, Sticker } = require("../../../utils/sticker")
const package = require("../../../package.json")
const { uploadImage } = require("../../../utils")
let { info, statistics } = require("../../../db")
let { stats } = info('stats')

module.exports = {
    tags: ['sticker', 'media'],
    args: ['text1 | text2'],
    cmd: ['memesticker', 'memestiker', 'stikermeme', 'smeme'],
    help: ['memesticker'],
    exec: async (m, client, { prefix, flags, cmd, args, body, url }) => {
        try {
            if (m.mtype == 'imageMessage' || m.quoted && m.quoted.mtype && m.quoted.mtype == 'imageMessage') {
                let [atas, bawah] = args.join(' ').replace('--nobg', '').replace('--removebg', '').split('|')
                const mediaData = await client.downloadMediaMessage(m.quoted ? m.quoted : m)
                let bgUrl;
                if (flags.find(v => v.match(/nobg|removebg/))) {
                    const removed = await Sticker.removeBG(mediaData)
                    bgUrl = await uploadImage(removed)
                } else {
                    bgUrl = await uploadImage(mediaData)
                }
                const res = await Sticker.memeGenerator(atas ? atas : '', bawah ? bawah : '', bgUrl)
                const data = new Sticker(res, { packname: `${package.name} #${stats.sticker}`, author: package.author })
                await client.sendMessage(m.chat, await data.toMessage(), { quoted: m })
                statistics('sticker')
            } else {
                m.reply(`${m.quoted && m.quoted.mtype == 'stickerMessage' ? 'you\'re replied a sticker message, please ' : ''}send/reply image. example :\n${prefix + cmd} aku diatas | kamu dibawah\n\nwith no background use --nobg`)
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
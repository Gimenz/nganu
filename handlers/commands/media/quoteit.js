const { drawImage } = require("../../../lib/quoteGen");
const { getBuffer } = require("../../../utils");

module.exports = {
    tags: ['media'],
    flags: ['background'],
    args: ['text quotes | watermark'],
    cmd: ['quoteit'],
    help: ['quoteit'],
    exec: async (m, client, { prefix, args, arg, flags }) => {
        try {
            if (args.length === 0) return m.reply('text quotes tidak boleh kosong')
            arg = flags.length ? arg.replace(`--${flags[0]}`, '') : arg
            let _text = arg.split('|')[0]
            let wm = arg.split('|')[1]
            if (_text.length > 250) return m.reply('No more spaces! text quotes terlalu panjang...')
            if (wm.length > 30) return m.reply('No more spaces! text watermark terlalu panjang...')
            if (m.mtype && m.mtype == 'imageMessage' || m.quoted && m.quoted.mtype && m.quoted.mtype == 'imageMessage') {
                const message = m.quoted ? m.quoted : m
                const bg = await client.downloadMediaMessage(message)
                const generated = await drawImage(_text, wm ? `~ ${wm}` : '', bg)
                await client.sendMessage(m.chat, { image: generated.toBuffer(), caption: 'success' }, { quoted: m })
            } else {
                const bg = `https://source.unsplash.com/1080x1080/?${flags.length ? flags[0] : 'nature'}`
                const generated = await drawImage(_text, wm ? `~ ${wm}` : '', (await getBuffer(bg)).buffer)
                await client.sendMessage(m.chat, { image: generated.toBuffer(), caption: 'success' }, { quoted: m })
            }
            console.log(arg.replace(`--${flags[0]}`, ''));
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
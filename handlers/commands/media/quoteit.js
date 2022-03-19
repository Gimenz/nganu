require('dotenv').config()
const { igApi } = require("insta-fetcher");
let ig = new igApi(process.env.session_id)
const { drawImage } = require("../../../lib/quoteGen");
const { getBuffer, maskStr } = require("../../../utils");
const config = require('../../../src/config.json')
const package = require('../../../package.json');
const { jidDecode } = require('@adiwajshing/baileys');

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
            wm = wm ? `~ ${wm}` : ''
            if (_text.length > 250) return m.reply('No more spaces! text quotes terlalu panjang... max 250 character')
            if (wm.length > 30) return m.reply('No more spaces! text watermark terlalu panjang...')
            if (m.mtype && m.mtype == 'imageMessage' || m.quoted && m.quoted.mtype && m.quoted.mtype == 'imageMessage') {
                const message = m.quoted ? m.quoted : m
                const bg = await client.downloadMediaMessage(message)
                const generated = await drawImage(_text, wm, bg)
                let caption = ''
                try {
                    if (config.autoPost) {
                        const uploadResponse = await ig.addPost(generated.toBuffer('image/jpeg'), 'feed', {
                            caption: `Created on ${package.name} by ${maskStr(jidDecode(m.sender).user)}`
                        })
                        caption += `Success. posted here https://www.instagram.com/p/${uploadResponse.media.code}`
                    } else {
                        caption += 'Success'
                    }
                    await client.sendMessage(m.chat, { image: generated.toBuffer(), caption }, { quoted: m })
                } catch (error) {
                    await client.sendMessage(m.chat, { image: generated.toBuffer(), caption }, { quoted: m })
                }
            } else {
                const bg = `https://source.unsplash.com/1080x1080/?${flags.length ? flags[0] : 'nature'}`
                const generated = await drawImage(_text, wm, (await getBuffer(bg)).buffer)
                let caption = ''
                try {
                    if (config.autoPost) {
                        const uploadResponse = await ig.addPost(generated.toBuffer('image/jpeg'), 'feed', {
                            caption: `Created on ${package.name} by ${maskStr(jidDecode(m.sender).user)}`
                        })
                        caption += `Success. posted here https://www.instagram.com/p/${uploadResponse.media.code}`
                    } else {
                        caption += 'Success'
                    }
                    await client.sendMessage(m.chat, { image: generated.toBuffer(), caption }, { quoted: m })
                } catch (error) {
                    await client.sendMessage(m.chat, { image: generated.toBuffer(), caption }, { quoted: m })
                }
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
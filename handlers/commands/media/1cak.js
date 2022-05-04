const Wancak = require('1cak-scraper')
const _ = require('lodash')
// support nsfw content, if you provide cookie.
// get cookie using dev tools (desktop browser), or eruda (mobile browser)
const jancok = new Wancak('');
const headers = {
    'Content-Type': 'image/*',
    Referer: 'https://1cak.com/'
}

let re = 'trending|vote|legendary|shuffle|random|search|lol'
module.exports = {
    tags: ['media'],
    args: ['query | args'],
    cmd: ['1cak', 'wancak'],
    help: ['1cak', 'wancak'],
    exec: async (m, client, { prefix, flags, cmd, args, body, url }) => {
        try {
            if (args[0] == 'search') {
                if (args.slice(1).length < 1) return m.reply('masukan query')
                let key = args.slice(1).join(' ')
                let res = await jancok.search(key)
                let media = _.sample(res)
                let caption = `*${media.title.trim()}* - ${moment(media.date).fromNow()} ${media.source}\n`
                caption += `\n*~* 😂 : ${media.vote}`
                caption += `\n*~* 🔞 : ${media.nsfw ? '✅' : '❌'}`
                caption += `\n*~* 🔗 : ${media.post}`
                await client.sendFileFromUrl(m.chat, media.media, caption, m, '', media.gif ? 'mp4' : 'jpeg', { viewOnce: true }, { headers })
            } else if (/vote|legendary|lol|trending/.test(args[0])) {
                const res = await jancok.section(args[0]);
                let media = _.sample(res)
                let caption = `*${media.title.trim()}* - ${moment(media.date).fromNow()} ${media.source}\n`
                caption += `\n*~* 😂 : ${media.vote}`
                caption += `\n*~* 🔞 : ${media.nsfw ? '✅' : '❌'}`
                caption += `\n*~* 🔗 : ${media.post}`
                await client.sendFileFromUrl(m.chat, media.media, caption, m, '', media.gif ? 'mp4' : 'jpeg', { viewOnce: true }, { headers })
            } else if (/random|shuffle/.test(args[0])) {
                const res = await jancok.shuffle();
                let media = res[0]
                let caption = `*${media.title.trim()}* - ${moment(media.date).fromNow()} ${media.source}\n`
                caption += `\n*~* 😂 : ${media.vote}`
                caption += `\n*~* 🔞 : ${media.nsfw ? '✅' : '❌'}`
                caption += `\n*~* 🔗 : ${media.post}`
                await client.sendFileFromUrl(m.chat, media.media, caption, m, '', media.gif ? 'mp4' : 'jpeg', { viewOnce: true }, { headers })
            } else {
                m.reply(`masukkan salah satu section\ncontoh : ${prefix}${cmd.match(/1cak|wancak/g)[0]} section\n\nlist section : \n-${re.split('|').join(`\n-`)}`)
            }
        } catch (error) {
            m.reply(util.format(error));
            console.log(error);
        }
    }
}
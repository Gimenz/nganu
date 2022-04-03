const google = require('googlethis')
const tanda = '```'

module.exports = {
    tags: ['tools'],
    cmd: ['google'],
    args: ['query'],
    help: ['google'],
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            if (args.length < 1) return m.reply(`query diperlukan\n\ncontoh ${prefix + cmd} kenapa cewe gabisa jujur?`)
            const options = {
                page: 0,
                safe: false, // hide explicit results?
                additional_params: {
                    // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
                    hl: 'id'
                }
            }
            const searc = await google.search(args.join(' '), options)
            let text = `✔ *Google Search*\n`
            let n = 1
            for (let x of searc.results) {
                text += `\n*_${n}_.* *${x.title}*\n${tanda}${x.description}${tanda}\n_🔗 link :_ ${x.url}\n`
                n++
            }
            m.reply(text)
        } catch (error) {
            console.log(error);
            m.reply('error, tidak ditemukan')
        }
    }
}
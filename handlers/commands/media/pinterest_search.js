const { pinterest } = require('../../../lib/pinterest')
const _ = require('lodash')
const { parseInt } = require('lodash')
const { delay } = require('@adiwajshing/baileys')

module.exports = {
    tags: ['media'],
    cmd: ['pinterest'],
    args: ['keyword'],
    help: ['pinterest'],
    exec: async (m, client, { args, arg, prefix, cmd }) => {
        try {
            if (args.length < 1) return m.reply(`query diperlukan\n\ncontoh ${prefix + cmd} petrik star`)
            let jumlah = parseInt(arg.split('|')[0]) || 5
            if (jumlah > 10) return m.reply('terlalu banyak jumlah, dapat mengakibatkan spam, max 10')
            let search = await pinterest.search(args.join(' '));
            if (search.length < 1) return m.reply('tidak ada')
            search = _.shuffle(search)
            for (let i = 0; i < jumlah; i++) {
                await delay(3000);
                client.sendFileFromUrl(m.chat, search[i].media.url, `${search[i].title}`)
            }
        } catch (error) {
            console.log(error);
            m.reply('error occurred')
        }
    }
}
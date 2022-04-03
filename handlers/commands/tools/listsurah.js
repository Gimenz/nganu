const { default: axios } = require('axios')
const { pasaran } = require('../../../lib/tgl')
const { shrt } = require('../../../utils')

module.exports = {
    tags: ['tools'],
    cmd: ['listsurah'],
    help: ['listsurah'],
    exec: async (m, client, { prefix, cmd, args, flags }) => {
        try {
            let example = `*Cara penggunaan :*\n\n` +
                `_menampilkan ayat secara spesifik :_\n${prefix}surah al-mulk 1\n\n` +
                `_menampilkan beberapa jumlah ayat :_\n${prefix}surah al-mulk 1-20\n(dengan artinya) : ${prefix}surah al-mulk 1-20 --arti\n`
            const find = await list()
            let tex = `${example}\n\nlist surah :`
            for (let x of find) {
                tex += `\n◈ *_${x.number}._* ${x.name.transliteration.id}`
            }

            m.reply(tex)
        } catch (error) {
            console.log(error);
            m.reply('error, tidak ditemukan')
        }
    }
}

async function list() {
    const { data } = await axios.get('https://api.quran.sutanlab.id/surah')
    return data.data
}
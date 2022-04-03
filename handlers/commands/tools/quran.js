const { default: axios } = require('axios')
const { pasaran } = require('../../../lib/tgl')
const { shrt } = require('../../../utils')

module.exports = {
    tags: ['tools'],
    cmd: ['surah', 'surat'],
    args: ['namasurah ayat'],
    help: ['surah'],
    exec: async (m, client, { prefix, cmd, args, flags }) => {
        try {
            let example = `*Cara penggunaan :*\n\n` +
                `_menampilkan ayat secara spesifik :_\n${prefix + cmd} al-mulk 1\n\n` +
                `_menampilkan beberapa jumlah ayat :_\n${prefix + cmd} al-mulk 1-20\n(dengan artinya) : ${prefix + cmd} al-mulk 1-20 --arti\n`
            if (args.length < 1) return m.reply(example)
            if (args[1].includes('-')) {
                const find = await list().then(res => {
                    return res.find(val => val.name.transliteration.id.toLowerCase() == args[0].toLowerCase())//res.findIndex(val => val.name.transliteration.id.toLowerCase().match(toRegExp(cari)))
                })
                const res = await getSurah(find.number)
                const ayat = res.data.verses
                const detil = res.data
                const range = args[1]
                const idxNUM = range.split('-')
                const dari = idxNUM[0]
                const ke = idxNUM[1]
                const max = (ke - dari);
                if (max > 30) return m.reply('maksimal jumlah ayat yang dapat ditampilkan adalah 30')
                const selectedRange = ayat.slice(dari - 1, ke)

                var tex = `✅ *Detail Informasi Surah*
◈ ${'Nama Surah :'} *${detil.name.transliteration.id}*
◈ ${'No Surah :'} *${res.data.number}*
◈ ${'Jumlah Ayat :'} *${res.data.numberOfVerses}*
◈ ${'Arti Surah :'} *${detil.name.translation.id}*
◈ ${'Tergolong surah ' + detil.revelation.id}\n`

                const withTranslation = flags.includes('arti')

                for (let i = 0; i < selectedRange.length; i++) {
                    tex += `\n*{ ${selectedRange[i].number.inSurah} }* - ${selectedRange[i].text.arab} ◈${withTranslation ? '\n' + selectedRange[i].translation.id + '\n\n' : '\n'}`
                }
                m.reply(tex)
            } else if (!isNaN(args[1])) {
                const find = await list().then(res => {
                    return res.find(val => val.name.transliteration.id.toLowerCase() == args[0].toLowerCase())//res.findIndex(val => val.name.transliteration.id.toLowerCase().match(toRegExp(cari)))
                })
                const res = await getSurah(find.number, args[1])
                const detil = res.data.surah

                var tex = `✅ *Detail Informasi Surah*
◈ ${'Nama Surah :'} *${detil.name.transliteration.id}*
◈ ${'No Surah :'} *${res.data.surah.number}*
◈ ${'Jumlah Ayat :'} *${res.data.surah.numberOfVerses}*
◈ ${'Arti Surah :'} *${detil.name.translation.id}*
◈ ${'Tergolong surah ' + detil.revelation.id}

*{ ${res.data.number.inSurah} }* - ${res.data.text.arab} ◈\n\n${res.data.translation.id}

◈ Tafsir Ayat: ${res.data.tafsir.id.short}`

                let idMp3 = shrt(res.data.audio.primary, { title: `${detil.name.transliteration.id} - ${res.data.number.inSurah}`, tiktokAudio: true })
                const btnCover = [
                    { quickReplyButton: { displayText: `Audio`, id: `${prefix}sendthis ${idMp3.id}` } },
                ]
                let buttonMessage = {
                    text: tex,
                    footer,
                    templateButtons: btnCover,
                }
                await client.sendMessage(m.chat, buttonMessage, { quoted: m })
            } else {
                const find = await list().then(res => {
                    return res.find(val => val.name.transliteration.id.toLowerCase() == args[0].toLowerCase())//res.findIndex(val => val.name.transliteration.id.toLowerCase().match(toRegExp(cari)))
                })
                const res = await getSurah(find.number, args[1])
                const detil = res.data.surah

                var tex = `✅ *Detail Informasi Surah*
◈ ${'Nama Surah :'} *${detil.name.transliteration.id}*
◈ ${'No Surah :'} *${res.data.number}*
◈ ${'Jumlah Ayat :'} *${res.data.numberOfVerses}*
◈ ${'Arti Surah :'} *${detil.name.translation.id}*
◈ ${'Tergolong surah ' + detil.revelation.id}

◈ Tafsir : ${res.data.tafsir.id}`

            }
        } catch (error) {
            console.log(error);
            m.reply(util.format(error))
        }
    }
}

async function list() {
    const { data } = await axios.get('https://api.quran.sutanlab.id/surah')
    return data.data
}

async function getSurah(number, ayat = '') {
    const { data } = await axios.get(`https://api.quran.sutanlab.id/surah/${number}/${ayat}`)
    return data
}
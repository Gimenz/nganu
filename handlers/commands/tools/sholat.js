const { default: axios } = require('axios')
const { pasaran } = require('../../../lib/tgl')

module.exports = {
    tags: ['tools'],
    cmd: ['sholat', 'jsholat'],
    args: ['kota'],
    help: ['sholat'],
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            if (args.length < 1) return m.reply(`nama kota diperlukan\n\ncontoh ${prefix + cmd} magelang`)
            const idKota = await getIDkota(args.join(' '));
            if (!idKota.status) return m.reply('kota tidak ditemukan, pastikan nama kota benar')
            const jadwals = await getJadwal(idKota.data[0].id)
            const { lokasi, jadwal } = jadwals.data
            let text = `*Jadwal Sholat* wilayah _${lokasi}_ dan sekitarnya
            
◈ ${pasaran().hijriyah}
◈ ${pasaran().jawa}

➤ *Imsak :* ${jadwal.imsak}
➤ *Subuh :* ${jadwal.subuh}
➤ *Terbit :* ${jadwal.terbit}
➤ *Dhuha :* ${jadwal.dhuha}
➤ *Dzuhur :* ${jadwal.dzuhur}
➤ *Ashar :* ${jadwal.ashar}
➤ *Maghrib :* ${jadwal.maghrib}
➤ *Isya :* ${jadwal.isya}

_*Catatan :*_ mungkin ada selisih beberapa menit dengan daerah masing masing
`
            m.reply(text)
        } catch (error) {
            console.log(error);
            m.reply('error, tidak ditemukan')
        }
    }
}

async function getIDkota(kota) {
    const { data } = await axios.get(`https://api.myquran.com/v1/sholat/kota/cari/${kota}`)
    return data
}

async function getJadwal(id, date = moment().format('YYYY/MM/DD')) {
    const { data } = await axios.get(`https://api.myquran.com/v1/sholat/jadwal/${id}/${date}`)
    return data
}


const YT = require('../../../lib/yt');

module.exports = {
    tags: ['downloader'],
    cmd: ['music'],
    args: ['judul - artis'],
    help: ['music'],
    exec: async (m, client, { prefix, args, cmd }) => {
        try {
            if (args.length < 1) return m.reply(`*Fitur mencari lagu full tag metadata, sangat disarankan unutk memasukkan judul lagu yang tepat*\n${prefix}${cmd} judul - artis\n\ncontoh : ${prefix}${cmd} samudra janji - bima tarore`)
            m.reply('proses')
            const search = await YT.searchTrack(args.join(' '))
            let caption = `✅ *Track ditemukan!*\n\n` +
                `*Source :* ${search[0].isYtMusic ? 'YouTube Music' : 'YouTube'}\n` +
                `*Title :* ${search[0].title}\n` +
                `*Artist :* ${search[0].artist}\n` +
                `*Durasi :* ${search[0].duration.label}`
            await client.sendFileFromUrl(m.chat, search[0].image, caption, m)
            const lagu = await YT.downloadMusic(search)
            await client.sendFile(m.chat, lagu.path, m, { fileName: lagu.meta.title + '.mp3', mimetype: 'audio/mp3', document: true, unlink: true })
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
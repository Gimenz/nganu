const YT = require('../../../lib/yt')
const { isUrl, secondsConvert } = require('../../../utils')

module.exports = {
    tags: ['downloader'],
    cmd: ['ytmp4', 'yt'],
    args: ['url'],
    help: ['ytmp4', 'yt'],
    exec: async (m, client, { prefix, args, cmd, url }) => {
        if (args.length < 1 || !isUrl(url) || !YT.isYTUrl(url)) return m.reply('Bukan link YouTube')
        try {
            m.reply('proses')
            const video = await YT.mp4(url)
            let caption = `✅ *YouTube Downloader*\n\n` +
                `*Title :* ${video.title}\n` +
                `*Channel :* ${video.channel}\n` +
                `*Published :* ${video.date}\n` +
                `*Quality :* ${video.quality}\n` +
                `*Durasi :* ${secondsConvert(video.duration)}`
            m.reply(caption)
            await client.sendFileFromUrl(m.chat, video.videoUrl, '', m)
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
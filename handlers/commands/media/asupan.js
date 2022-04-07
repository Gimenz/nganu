const tik = require('../../../lib/tiktok')
const _ = require('lodash')

module.exports = {
    tags: ['media'],
    cmd: ['asupan'],
    args: ['hashtagtiktok'],
    help: ['asupan'],
    exec: async (m, client, { args, flags }) => {
        try {
            const opt = flags.find(x => /date|views|followers|shuffle/g.test(x))
            const data = await tik.getHashtagVideo(args.join(' ').replace('#', ''), opt ? opt : 'shuffle')
            if (data.length === 0) return m.reply('video not found')
            const { video, author } = _.sample(data)
            const tikUrl = `https://www.tiktok.com/@${author.uniqueId}/video/${video.id}`
            await client.sendFileFromUrl(m.chat, video.playAddr, `Asupan dari => @${author.uniqueId}\n${(await tik.shorten(tikUrl)).shortlink}`, m)
        } catch (error) {
            console.log(error);
            m.reply('error occurred')
        }
    }
}
const { SimpleTikApi } = require('../../../lib/tiktok')
const _ = require('lodash')
const { randomInt } = require('crypto')

module.exports = {
    tags: ['media'],
    cmd: ['asupan'],
    args: ['hashtag', 'keyword'],
    help: ['asupan'],
    exec: async (m, client, { args, flags }) => {
        try {
            const opt = flags.find(x => /date|views|followers|shuffle/g.test(x))
            const q = args.join(' ').replace('--' + opt, '')
            m.reply('proses')
            if (q.startsWith('#')) {
                const data = await SimpleTikApi.hashtag(q.replace('#', ''), opt ? opt : 'shuffle')
                if (data.length === 0) return m.reply('video not found')
                const { video, author } = _.sample(data)
                const tikUrl = `https://www.tiktok.com/@${author.uniqueId}/video/${video.id}`
                await client.sendFileFromUrl(m.chat, video.playAddr, `Posted at ${moment(createTime * 1000).format('DD MMM YYYY')}\n${desc}\n\nAsupan dari => @${author.uniqueId}\n${(await SimpleTikApi.shorten(tikUrl)).shortlink}`, m)
            } else if (q.startsWith('@')) {
                const search = await SimpleTikApi.getVideoByUsername(q.replace('@', ''))
                const { video, author } = _.sample(search)
                const tikUrl = `https://www.tiktok.com/@${author}/video/${video.id}`
                await client.sendFileFromUrl(m.chat, video.playAddr, `Posted at ${moment(createTime * 1000).format('DD MMM YYYY')}\n${desc}\n\nAsupan dari => @${author}\n${(await SimpleTikApi.shorten(tikUrl)).shortlink}`, m)
            } else {
                const search = await SimpleTikApi.search(q, 50, randomInt(20))
                const { video, author, desc, createTime } = _.sample(search)
                const tikUrl = `https://www.tiktok.com/@${author.uniqueId}/video/${video.id}`
                await client.sendFileFromUrl(m.chat, video.playAddr, `Posted at ${moment(createTime * 1000).format('DD MMM YYYY')}\n${desc}\n\nAsupan dari => @${author.uniqueId}\n${(await SimpleTikApi.shorten(tikUrl)).shortlink}`, m)
            }
        } catch (error) {
            console.log(error);
            m.reply('error occurred')
        }
    }
}
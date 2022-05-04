
const { SimpleTikApi } = require('../../../lib/tiktok');
const { formatK, fetchAPI } = require('../../../utils');

module.exports = {
    tags: ['stalking'],
    args: ['username'],
    cmd: ['tiktokstalk'],
    help: ['tiktokstalk'],
    exec: async (m, client, { prefix, args, arg, flags }) => {
        try {
            if (args.length < 1) return m.reply('username diperlukan')
            if (args.length > 1) return m.reply('tidak manusiawi jika username melebihi 1 kata')
            const { UserModule } = await SimpleTikApi.user(args[0])
            const user = Object.values(UserModule.users)[1]
            const stats = Object.values(UserModule.stats)[1]
            const caption = `*TikTok Profile*\n\n` +
                `➤ *Username :* @${user.uniqueId}\n` +
                `➤ *Nickname :* ${user.nickname}\n` +
                `➤ *Private :* ${user.privateAccount ? '✅' : '❌'}\n` +
                `➤ *Followers :* ${formatK(stats.followerCount)}\n` +
                `➤ *Following :* ${formatK(stats.followingCount)}\n` +
                `➤ *Total Hearts :* ${formatK(stats.heartCount)}\n` +
                `➤ *Total Videos :* ${formatK(stats.videoCount)}\n` +
                `➤ *Created on :* ${moment(user.createTime * 1000).format('DD/MM/YY HH:mm:ss')}\n` +
                `➤ *Bio :* ${user.signature}`
            await client.sendFileFromUrl(m.chat, user.avatarLarger, caption, m)
        } catch (error) {
            m.reply('emror');
            console.log(error);
        }
    }
}
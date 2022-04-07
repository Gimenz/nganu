require('dotenv').config()
const { igApi } = require("insta-fetcher");
const { formatK, fetchAPI } = require('../../../utils');
let ig = new igApi(process.env.session_id);

module.exports = {
    tags: ['media'],
    args: ['username'],
    cmd: ['tiktokstalk'],
    help: ['tiktokstalk'],
    exec: async (m, client, { prefix, args, arg, flags }) => {
        try {
            if (args.length < 1) return m.reply('username diperlukan')
            const { result } = await fetchAPI('masgi', '/tiktok/user.php?u=' + args[0].replace('@', ''))
            const caption = `*TikTok Profile*\n\n` +
                `➤ *Username :* @${result.user.uniqueId}\n` +
                `➤ *Nickname :* ${result.user.nickname}\n` +
                `➤ *Private :* ${result.user.privateAccount ? '✅' : '❌'}\n` +
                `➤ *Followers :* ${formatK(result.stats.followerCount)}\n` +
                `➤ *Following :* ${formatK(result.stats.followingCount)}\n` +
                `➤ *Total Hearts :* ${formatK(result.stats.heartCount)}\n` +
                `➤ *Total Videos :* ${formatK(result.stats.videoCount)}\n` +
                `➤ *Created on :* ${moment(result.user.createTime * 1000).format('DD/MM/YY HH:mm:ss')}\n` +
                `➤ *Bio :* ${result.user.signature}`
            await client.sendFileFromUrl(m.chat, result.user.avatarLarger, caption, m)
        } catch (error) {
            m.reply('emror');
            console.log(error);
        }
    }
}
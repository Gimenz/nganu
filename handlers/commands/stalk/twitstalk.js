
const twit = require('../../../lib/twit');
const { formatK } = require('../../../utils');

module.exports = {
    tags: ['stalking'],
    args: ['username'],
    cmd: ['twitterstalk', 'twtstalk'],
    help: ['twitterstalk'],
    exec: async (m, client, { prefix, args, cmd, flags }) => {
        try {
            if (args.length < 1) return m.reply(`username diperlukan, contoh ${prefix + cmd} masgimenz`)
            if (args.length > 1) return m.reply(`sangat tidak etis jikalau username melebihi 1 kata`)
            const user = await twit.user(args[0])
            if (!user.status) return m.reply(`username tidak ditemukan`)
            let text = `✅ *Twitter Stalk*\n` +
                `• Username : @${user.screen_name}\n` +
                `• Name : ${user.name ? user.name : '-'}\n` +
                `• Location : ${user.location}\n` +
                `• Tweets : ${formatK(user.statuses_count)}\n` +
                `• Following : ${formatK(user.friends_count)}\n` +
                `• Followers : ${formatK(user.followers_count)}\n` +
                `• Private : ${user.protected ? '✅' : '❌'}\n` +
                `• Secret : ${user.secret ? '✅' : '❌'}\n` +
                `• Verified : ${user.verified ? '✅' : '❌'}\n` +
                `• Joined : ${moment(user.created_at).format('MMM YYYY')}\n` +
                `• Bio : ${user.description ? user.description : '-'}`
            client.sendFileFromUrl(m.chat, user.profile_image_url_https.replace('_normal', ''), text, m)
        } catch (error) {
            m.reply('emror');
            console.log(error);
        }
    }
}
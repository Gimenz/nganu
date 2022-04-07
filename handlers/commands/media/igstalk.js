require('dotenv').config()
const { igApi } = require("insta-fetcher");
const { formatK } = require('../../../utils');
let ig = new igApi(process.env.session_id);

module.exports = {
    tags: ['media'],
    args: ['username'],
    cmd: ['igstalk', 'stalk'],
    help: ['igstalk'],
    exec: async (m, client, { prefix, args, arg, flags }) => {
        try {
            if (args.length < 1) return m.reply('username diperlukan')
            const user = await ig.fetchUserV2(args[0])
            let text = `✅ *Sukses Get Porfil Instagram*\n` +
                `◆ Username : ${user.username}\n` +
                `◆ Full Name : ${user.full_name}\n` +
                `◆ Following : ${formatK(user.edge_follow.count)}\n` +
                `◆ Followers : ${formatK(user.edge_followed_by.count)}\n` +
                `◆ Private : ${user.is_private ? '✅' : '❌'}\n` +
                `◆ Business : ${user.is_business_account ? '✅' : '❌'}\n` +
                `◆ Verified : ${user.is_verified ? '✅' : '❌'}\n` +
                `◆ Posts : ${user.edge_owner_to_timeline_media.count}${user.external_url != null ? `\n◆ Link : ${user.external_url}\n` : '\n'}` +
                `◆ Link Profile : https://instagram.com/${user.username}\n\n` +
                `${user.biography}`
            client.sendFileFromUrl(m.chat, user.profile_pic_url_hd, text, m)
        } catch (error) {
            m.reply('emror');
            console.log(error);
        }
    }
}
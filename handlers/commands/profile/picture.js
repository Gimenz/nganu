const { isUrl } = require("../../../utils")

module.exports = {
    tags: ['owner'],
    cmd: ['setdp'],
    help: ['setdp'],
    owner: true,
    exec: async (m, client, { url, prefix, args, cmd, flags }) => {
        try {
            if (/imageMessage/.test(m.mtype) || m.quoted && m.quoted.type == 'imageMessage') {
                const message = m.quoted ? m.quoted : m
                const buffer = await client.downloadMediaMessage(message)
                await client.updateProfilePicture(client.user.id, buffer)
                m.reply('success')
            } else if (isUrl(url)) {
                await client.updateProfilePicture(client.user.id, { url })
                m.reply('success')
            } else {
                m.reply(`send/reply image, or you can use url that containing image`)
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
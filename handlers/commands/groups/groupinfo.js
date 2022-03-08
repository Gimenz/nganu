const { getBuffer } = require("../../../utils");

module.exports = {
    tags: ['groups'],
    cmd: ['groupinfo', 'infogroup'],
    help: ['groupinfo', 'infogroup'],
    group: true,
    botAdmin: false,
    admin: false,
    exec: async (m, client, { cmd, args }) => {
        try {
            const _meta = await client.groupMetadata(m.chat)
            let _img;
            try { _img = await client.profilePictureUrl(_meta.id, 'image') } catch (e) { _img = './src/logo.jpg' }
            let caption = `${_meta.subject} - Created by @${_meta.owner.split('@')[0]} on ${moment(_meta.creation * 1000).format('ll')}\n\n` +
                `*${_meta.participants.length}* Total Members\n*${_meta.participants.filter(x => x.admin === 'admin').length}* Admin\n*${_meta.participants.filter(x => x.admin === null).length}* Not Admin\n\n` +
                `Group ID : ${_meta.id}`
            await client.sendMessage(m.chat,
                {
                    caption,
                    image: (await getBuffer(_img)).buffer,
                    jpegThumbnail: (await getBuffer('./src/logo.jpg')).buffer,
                    mentions: [_meta.owner]
                },
                { quoted: m }
            )
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}

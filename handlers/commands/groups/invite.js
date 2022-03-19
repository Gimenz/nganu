module.exports = {
    cmd: ['inv', 'invite'],
    help: ['inv', 'invite'],
    args: ['reply msg'],
    tags: ['groups'],
    group: true,
    botAdmin: true,
    admin: true,
    exec: async (m, client) => {
        try {
            if (m.quoted) {
                const _user = m.quoted.sender;
                try {
                    await client.groupParticipantsUpdate(m.chat, [_user], 'add')
                } catch (error) {
                    m.reply('private')
                    const inviteCode = await client.groupInviteCode(m.chat)
                    let thumb;
                    try { thumb = await client.profilePictureUrl(m.chat, 'image') } catch (e) { thumb = './src/logo.jpg' }
                    await client.sendGroupV4Invite(m.chat, _user, inviteCode, moment().add('3', 'days').unix(), false, thumb)
                    m.reply('inviting...')
                }
            } else {
                m.reply(`reply pesan user yg mau di invite`)
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
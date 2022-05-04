const { isUrl } = require("../../../utils")
const package = require("../../../package.json")

module.exports = {
    tags: ['groups'],
    cmd: ['groupset'],
    opts: ['close', 'open', 'image', 'title', 'desc'],
    help: ['groupset'],
    group: true,
    botAdmin: true,
    admin: true,
    exec: async (m, client, { body, url, prefix, args, cmd, flags }) => {
        try {
            let _text = args.slice(1).join(' ')

            if (/^lock|tutup|close$/.test(args[0])) {
                await client.groupSettingUpdate(m.chat, 'announcement')
                m.reply('success')
            } else if (/^buka|open|unlock$/.test(args[0])) {
                await client.groupSettingUpdate(m.chat, 'not_announcement')
                m.reply('success')
            } else if (args[0] === 'image' || args[0] === 'dp') {
                if (m.mtype == 'imageMessage' || m.quoted && m.quoted.mtype == 'imageMessage') {
                    const message = m.quoted ? m.quoted : m
                    const buffer = await client.downloadMediaMessage(message)
                    await client.updateProfilePicture(m.chat, buffer)
                } else if (isUrl(url)) {
                    await client.updateProfilePicture(m.chat, { url })
                } else {
                    m.reply(`send/reply image, or you can use url that containing image`)
                }
            } else if (/^title|name|nama|subject$/.test(args[0])) {
                if (_text.length < 1) return m.reply(`Mengubah nama group, example: ${prefix + cmd} ${args[0]} ${package.name}`)
                const _before = (await client.groupMetadata(m.chat)).subject
                await client.groupUpdateSubject(m.chat, _text)
                m.reply(`Berhasil mengubah nama group.\n\nBefore : ${_before}\nAfter : ${_text}`)
            } else if (/^desc|desk|deskripsi|description|rules$/.test(args[0])) {
                if (_text.length < 1) return m.reply(`Mengubah deskripsi group, example: ${prefix + cmd} ${args[0]} ssstt... dilarang mengontol wkwkwk!`)
                await client.groupUpdateDescription(m.chat, _text)
            } else {
                m.reply(`masukkan opsi, conth: ${prefix + cmd} lock => menutup group\n\nlist opsi:\n-${this.opts.join('\n-')}`)
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
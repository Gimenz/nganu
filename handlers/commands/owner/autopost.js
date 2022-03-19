const fs = require('fs')

let config = require('../../../src/config.json')

module.exports = {
    tags: ['owner'],
    args: ['on|off'],
    help: ['autopost'],
    cmd: ['autopost'],
    owner: true,
    exec: async (m, client, { body, msg, args }) => {
        try {
            await client.presenceSubscribe(m.chat)
            await client.sendPresenceUpdate('composing', m.chat)
            if (args[0] === 'on') {
                if (config.autoPost) return m.reply('✅ *Auto Post* sudah Aktif sebelumnya!')
                config.autoPost = true
                fs.writeFileSync('./src/config.json', JSON.stringify(config, null, 2))
                m.reply('✅ *Auto Post* Aktif!')
            } else if (args[0] == 'off') {
                if (!config.autoPost) return m.reply('❌ *Auto Post* sudah Nonaktif sebelumnya!')
                config.autoPost = false
                fs.writeFileSync('./src/config.json', JSON.stringify(config, null, 2))
                m.reply('❌ *Auto Post* Nonaktif!')
            } else {
                m.reply('silahkan pilih on / off')
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
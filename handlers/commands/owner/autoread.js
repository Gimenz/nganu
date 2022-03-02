const fs = require('fs')

const config = require('../../../src/config.json')

module.exports = {
    tags: ['owner'],
    args: ['on|off'],
    help: ['autoread'],
    owner: true,
    exec: async (m, client, { body, msg, args }) => {
        try {
            await client.presenceSubscribe(m.chat)
            await client.sendPresenceUpdate('composing', m.chat)
            if (args[0] === 'on') {
                if (config.autoRead) return m.reply('✅ *Auto Read* sudah Aktif sebelumnya!')
                config.autoRead = true
                fs.writeFileSync('./src/config.json', JSON.stringify(config, null, 2))
            } else if (args[0] == 'off') {
                if (!config.autoRead) return m.reply('❌ *Auto Read* sudah Nonaktif sebelumnya!')
                config.autoRead = false
                fs.writeFileSync('./src/config.json', JSON.stringify(config, null, 2))
            } else {
                m.reply('silahkan pilih on / off')
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
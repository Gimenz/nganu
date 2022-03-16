const fs = require('fs')

let config = require('../../../src/config.json')

module.exports = {
    tags: ['owner'],
    args: ['on|off'],
    help: ['typing'],
    cmd: ['typing', 'composing'],
    owner: true,
    exec: async (m, client, { body, msg, args }) => {
        try {
            if (args[0] === 'on') {
                if (config.autoRead) return m.reply('✅ *Auto Typing* sudah Aktif sebelumnya!')
                config.autoRead = true
                fs.writeFileSync('./src/config.json', JSON.stringify(config, null, 2))
                m.reply('✅ *Auto Typing* Aktif!')
            } else if (args[0] == 'off') {
                if (!config.autoRead) return m.reply('❌ *Auto Typing* sudah Nonaktif sebelumnya!')
                config.autoRead = false
                fs.writeFileSync('./src/config.json', JSON.stringify(config, null, 2))
                m.reply('❌ *Auto Typing* Nonaktif!')
            } else {
                m.reply('silahkan pilih on / off')
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
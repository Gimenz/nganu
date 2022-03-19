const translate = require('@vitalets/google-translate-api');

module.exports = {
    tags: ['tools'],
    cmd: ['tr', 'translate'],
    args: ['text'],
    help: ['tr'],
    exec: async (m, client, { prefix, cmd, args }) => {
        try {
            let lang = args[0]
            if (!lang) return m.reply(`code bahasa tujuan diperlukan, contoh ${prefix + cmd} id i love you, not only at this time`)
            if (m.quoted) {
                _text = m.quoted.text
                const tr = (await translate(_text, { to: lang })).text
                m.reply(tr)
            } else if (args.length >= 2) {
                _text = args.slice(1).join(' ')
                const tr = (await translate(_text, { to: lang })).text
                m.reply(tr)
            } else {
                m.reply(`reply pesan atau masukkan text, contoh ${prefix + cmd} id i love you, not only at this time`)
            }
        } catch (error) {
            console.log(error);
            m.reply('error, sepertinya code bahasa tidak support')
        }
    }
}
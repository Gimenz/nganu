const translate = require('@vitalets/google-translate-api');

module.exports = {
    tags: ['tools'],
    cmd: ['tr', 'translate'],
    args: ['text'],
    help: ['tr'],
    exec: async (m, client, { prefix, cmd, args, flags }) => {
        try {
            let lang = args[0]
            if (!lang) return m.reply(`code bahasa tujuan diperlukan, contoh ${prefix + cmd} id i love you, not only at this time`)
            let options = {
                to: lang
            }
            if (flags) options['from'] = flags[0]
            if (m.quoted) {
                _text = m.quoted.text
                const tr = (await translate(_text, options)).text
                m.reply(tr)
            } else if (args.length >= 2) {
                _text = args.slice(1).join(' ').replace('--' + flags[0], '')
                const tr = (await translate(_text, options)).text
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
let syntaxerror = require('syntax-error');

module.exports = {
    tags: ['owner'],
    startsWith: ['>'],
    args: ['code'],
    help: ['>'],
    owner: true,
    exec: async (m, client, { body, msg, args }) => {
        try {
            await client.presenceSubscribe(m.chat)
            await client.sendPresenceUpdate('composing', m.chat)
            let _return;
            let _syntax = '';
            let _text = body.slice(2);
            try {
                let i = 15
                let exec = new (async () => { }).constructor('print', 'msg', 'require', 'client', 'm', 'axios', 'fs', 'exec', _text);
                _return = await exec.call(client, (...args) => {
                    if (--i < 1) return
                    console.log(...args)
                    return m.reply(util.format(...args))
                }, msg, require, client, m, axios, fs, exec);
            } catch (e) {
                let err = syntaxerror(_text, 'Execution Function', {
                    allowReturnOutsideFunction: true,
                    allowAwaitOutsideFunction: true
                })
                if (err) _syntax = '```' + err + '```\n\n'
                _return = e
            } finally {
                m.reply(_syntax + util.format(_return))
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
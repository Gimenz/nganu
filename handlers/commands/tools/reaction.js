module.exports = {
    tags: ['tools'],
    cmd: ['r', 'react'],
    help: ['react'],
    exec: async (m, client, { args }) => {
        try {
            if (args.length < 1) return m.reply('emoji diperlukan')
            if (m.quoted) {
                m.quoted.react(args.join(' '))
            } else {
                m.reply('reply pesan')
            }
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
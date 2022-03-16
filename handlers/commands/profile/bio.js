module.exports = {
    tags: ['owner'],
    cmd: ['setbio', 'setstatus'],
    help: ['setbio'],
    owner: true,
    exec: async (m, client, { args }) => {
        try {
            if (args.length < 1) return m.reply('apa bang?')
            const _text = args.join(' ')
            await client.setStatus(_text)
            m.reply('success.')
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
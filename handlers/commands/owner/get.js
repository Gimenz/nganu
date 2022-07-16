const { default: axios } = require('axios')

module.exports = {
    tags: ['owner'],
    args: ['url'],
    help: ['get'],
    cmd: ['get'],
    owner: true,
    exec: async (m, client, { body, msg, args }) => {
        try {
            const { data } = await axios.get(args.join(' '))
            m.reply(util.format(data))
        } catch (error) {
            m.reply(util.format(error))
            console.log(error);
        }
    }
}
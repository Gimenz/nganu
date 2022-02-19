module.exports = {
    tags: ['testing'],
    startsWith: ['`'],
    exec: (m, client, { args }) => {
        m.reply(args.join(' '))
    }
}
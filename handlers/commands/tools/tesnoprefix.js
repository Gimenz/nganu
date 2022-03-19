module.exports = {
    tags: ['testing'],
    disabled: true,
    startsWith: ['`'],
    exec: (m, client, { args }) => {
        m.reply(args.join(' '))
    }
}
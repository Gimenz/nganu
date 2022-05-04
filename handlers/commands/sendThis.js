module.exports = {
    cmd: ['sendthis'],
    disabled: true,
    exec: async (m, client, { args, flags }) => {
        try {
            let id = tempDB.filter(x => x.id == args[0])[0]
            if (id.tiktokAudio) {
                let opts = { fileName: id.title + '.mp3' }
                if (flags.find(x => x == 'vn')) opts.audio = true
                await client.sendFileFromUrl(m.chat, id.url, '', m, '', 'mp3', opts)
            } else if (id.highlightCover) {
                await client.sendFileFromUrl(m.chat, id.url, `Highlight Cover [${id.title}]`, m)
            }
        } catch (error) {
            console.log(error);
            m.reply('error')
        }
    }
}
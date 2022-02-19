module.exports = {
    cmd: ['sendthis'],
    disabled: true,
    exec: async (m, client, { args }) => {
        try {
            let id = tempDB.filter(x => x.id == args[0])[0]
            if (id.tiktokAudio) {
                await client.sendFileFromUrl(m.chat, id.url, '', m, '', 'mp3', { fileName: id.title + '.mp3' })
            } else if (id.highlightCover) {
                await client.sendFileFromUrl(m.chat, id.url, `Highlight Cover [${id.title}]`, m)
            }
        } catch (error) {
            console.log(error);
            m.reply('error')
        }
    }
}
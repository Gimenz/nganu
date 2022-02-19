const { isUrl } = require("../../../utils");

module.exports = {
    tags: ['tools'],
    cmd: ['short'],
    args: ['url'],
    help: ['short'],
    exec: async (m, client, { url }) => {
        try {
            if (!shortenerAuth) return m.reply('shortener auth didn\'t set yet')
            if (!isUrl(url)) return m.reply('bukan url')
            const { link } = await sID.short(url);
            m.reply('shortened => ' + link)
        } catch (error) {
            console.log(error);
            m.reply('error')
        }
    }
}
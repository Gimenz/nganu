const { isUrl, fetchAPI } = require("../../../utils");
const FormData = require('form-data')

module.exports = {
    tags: ['tools'],
    cmd: ['short'],
    args: ['url'],
    help: ['short'],
    exec: async (m, client, { url }) => {
        try {
            if (!isUrl(url)) return m.reply('bukan url')
            const form = new FormData()
            form.append('url', url)
            const data = await fetchAPI(global.API['masgi'], '/s.php', {
                method: 'POST',
                headers: {
                    ...form.getHeaders()
                },
                data: form
            })
            m.reply('shortened => ' + data.url)
        } catch (error) {
            console.log(error);
            m.reply('error')
        }
    }
}
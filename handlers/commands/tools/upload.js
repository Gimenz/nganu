const { uploadFile, uploadImage } = require("../../../utils")

module.exports = {
    tags: ['tools'],
    cmd: ['upload', 'uploadimage'],
    help: ['upload', 'uploadimage'],
    exec: async (m, client, { prefix, cmd }) => {
        try {
            let mediaType = m.quoted ? m.quoted.mtype : m.mtype
            if (!/audio|video|document|image/.test(mediaType)) return m.reply(`reply media yang akan di upload`)
            let buff = m.quoted ? await m.quoted.download() : m.download()
            if (cmd == 'upload') {
                await uploadFile(buff)
                    .then(res => {
                        m.reply(JSON.stringify(res.data, null, 2))
                    })
            } else if (cmd == 'uploadimage') {
                await uploadImage(buff)
                    .then(res => {
                        m.reply(res)
                    })
            }
        } catch (error) {
            console.log(error);
            m.reply('error')
        }
    }
}
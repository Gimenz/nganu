const { S_WHATSAPP_NET, getHttpStream, toBuffer } = require('@adiwajshing/baileys')
const { fromBuffer } = require('file-type')
const { AxiosRequestConfig } = require('axios')
const fs = require('fs')
if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp', { recursive: true })
}

const getRandom = (ext = '') => {
    return `${Math.floor(Math.random() * 10000)}.${ext}`
}

/**
 * save file from url to local dir with automatic filename + ext 
 * @param {string} url The url
 * @param {string} extension optional extension
 * @param {AxiosRequestConfig} optionsOverride You can use this to override the [axios request config](https://github.com/axios/axios#request-config)
 * @returns {Promise<Object>}
 */
const download = (url, extension, optionsOverride = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            let stream = await getHttpStream(url, optionsOverride)
            const buffer = await toBuffer(stream)
            const type = await fromBuffer(buffer)
            let filepath = `./temp/${new Date().getTime()}.${extension || type.ext}`
            fs.writeFileSync(filepath, buffer.toString('binary'), 'binary')
            let nganu = {
                filepath: filepath,
                mimetype: type.mime,
            }
            resolve(nganu)
        } catch (error) {
            console.log(error);
        }
    })
}

const parseMention = (text) => [...text.matchAll(/@?([0-9]{5,16}|0)/g)].map((v) => v[1] + S_WHATSAPP_NET);

module.exports = {
    getRandom,
    download,
    parseMention
}

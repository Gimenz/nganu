const fs = require('fs')
const mime = require('mime-types')

exports.getRandom = (ext = '') => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

/**
 * save file from url to local dir with automatic filename + ext 
 * @param {string} url The url
 * @param {*} filename filename
 * @param {*} optionsOverride You can use this to override the [axios request config](https://github.com/axios/axios#request-config)
 * @returns 
 */
exports.download = (url, extension, optionsOverride = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { headers, data } = await axios.get(url, { responseType: 'stream', ...optionsOverride })
            let file = fs.createWriteStream(`./temp/${new Date().getTime()}.${extension || mime.extension(headers['content-type'])}`, { flags: 'w' })
            data.pipe(file)
            file.on('finish', function () {
                file.close()
                let nganu = {
                    filepath: file.path,
                    mimetype: mime.lookup(file.path),
                }
                resolve(nganu)
            })

        } catch (error) {
            console.log(error);
        }
    })
}

exports.parseMention = (text) => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net');

function androidToRgba(color) {
    const colorArray = []
    for (let i = 0; i < 4; i++) {
        colorArray.push(color % 256)
        color >>>= 8
    }
    const alpha = colorArray.pop() / 255
    return `rgba(${colorArray.reverse()},${alpha})`
}


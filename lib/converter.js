/**
 * Author  : Gimenz
 * Name    : nganu
 * Version : 1.0
 * Update  : 09 Januari 2022
 * 
 * If you are a reliable programmer or the best developer, please don't change anything.
 * If you want to be appreciated by others, then don't change anything in this script.
 * Please respect me for making this tool from the beginning.
 */

const ffmpeg = require('fluent-ffmpeg')
const { randomBytes } = require('crypto')
const fs = require('fs')
const { isUrl } = require('../utils')
const { getHttpStream, toBuffer } = require('@adiwajshing/baileys-md')
const sharp = require('sharp')

/**
 * mboh radong
 * @param {Buffer} data video mp4 buffer
 * @returns {Promise<Buffer} webp Buffer
 */
async function toGif(data) {
    try {
        const input = `./temp/video_${randomBytes(3).toString('hex')}.mp4`
        const output = `./temp/${randomBytes(3).toString('hex')}.gif`
        fs.writeFileSync(input, data.toString('binary'), 'binary')
        const file = await new Promise((resolve) => {
            ffmpeg(input)
                .outputOption("-vf", "scale=320:-1:flags=lanczos,fps=15")
                .save(output)
                .on('end', () => resolve(output))
        })
        //const out = opt == 'buffer' ? fs.readFileSync(file) : fs.createReadStream(file);
        let result = fs.readFileSync(file)
        [input, output].forEach((file) => fs.unlinkSync(file))
        return result
    } catch (error) {
        console.log(error);
    }
}

/**
 * mboh radong
 * @param {Buffer|URL|string} data video mp4 buffer | url | path
 * @returns {Promise<Buffer} webp Buffer
 */
async function toAudio(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const get = await toBuffer(await getHttpStream(data))
            const inputPath = `./temp/video_${randomBytes(3).toString('hex')}.mp4`
            const input = Buffer.isBuffer(data)
                ? save(data, inputPath)
                : fs.existsSync(data)
                    ? data
                    : isUrl(data)
                        ? save(get, inputPath)
                        : data

            const output = `./temp/${randomBytes(3).toString('hex')}.mp3`
            const file = await new Promise((resolve) => {
                ffmpeg(input)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate('128k')
                    .audioCodec('libmp3lame')
                    .audioQuality(5)
                    .toFormat('mp3')
                    .save(output)
                    .on('end', () => resolve(output))
            })
            //const out = opt == 'buffer' ? fs.readFileSync(file) : fs.createReadStream(file);
            let result = fs.readFileSync(file)
            resolve(result)
            try {
                fs.unlinkSync(inputPath)
                fs.unlinkSync(output)
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        }
    })
}

/**
 * write file from buffer
 * @param {Buffer} buffer buffer
 * @param {string} path path to save file
 * @returns 
 */
function save(buffer, path) {
    try {
        fs.writeFileSync(path, buffer.toString('binary'), 'binary')
        return path
    } catch (error) {
        console.log(error);
    }
}

/**
 * Resize image 
 * @param {Buffer} buffer 
 * @param {Number} width 
 * @param {Number} height 
 * @returns {Promise<Buffer>}
 */
const resizeImage = (buffer, width, height) => {
    if (!Buffer.isBuffer(buffer)) throw 'Input is not a Buffer'
    return new Promise(async (resolve) => {
        sharp(buffer)
            .resize(width, height, { fit: 'contain' })
            .toBuffer()
            .then(resolve)
    })
}

module.exports = {
    toGif,
    toAudio,
    resizeImage
}
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
const { spawn } = require('child_process')
const path = require('path')

/**
 * mboh radong
 * @param {Buffer} data video mp4 buffer
 * @returns {Promise<Buffer} webp Buffer
 */
async function toGif(data) {
    try {
        const input = `../temp/${randomBytes(3).toString('hex')}.webp`
        const output = `../temp/${randomBytes(3).toString('hex')}.gif`
        fs.writeFileSync(input, data.toString('binary'), 'binary')
        const file = await new Promise((resolve) => {
            spawn(`convert`, [
                input,
                output
            ])
                .on('error', (err) => { throw err })
                .on('exit', () => resolve(output))
        })
        let result = fs.readFileSync(file)
        try {
            fs.unlinkSync(input)
            fs.unlinkSync(output)
        } catch (error) {
            console.log(error);
        }
        return result
    } catch (error) {
        console.log(error);
    }
}

async function toMp4(data) {
    try {
        let inPath = `./temp/${randomBytes(3).toString('hex')}.gif`
        const input = fs.existsSync(data) ? data : save(data, inPath)
        const output = `./temp/${randomBytes(3).toString('hex')}.mp4`
        const file = await new Promise((resolve) => {
            ffmpeg(input)
                .outputOptions([
                    "-pix_fmt yuv420p",
                    "-c:v libx264",
                    "-movflags +faststart",
                    "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
                ])
                .toFormat('mp4')
                .noAudio()
                .save(output)
                .on('exit', () => resolve(output))
        })
        let result = await fs.promises.readFile(file)
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
 * convert mp3 to 8D Audio
 * @param {string|Buffer} input 
 * @returns
 */
const EightD = async (input) => {
    const inputPath = `./temp/${randomBytes(3).toString('hex')}.mp3`
    input = Buffer.isBuffer(input) ? save(input, inputPath) : input
    const output = `./temp/${randomBytes(3).toString('hex')}.mp3`
    const file = await new Promise((resolve) => {
        ffmpeg(input)
            .audioFilter(['apulsator=hz=0.125'])
            .audioFrequency(44100)
            .audioChannels(2)
            .audioBitrate('128k')
            .audioCodec('libmp3lame')
            .audioQuality(5)
            .toFormat('mp3')
            .save(output)
            .on('end', () => resolve(output))
    })
    return file
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
    toMp4,
    toAudio,
    EightD,
    resizeImage
}
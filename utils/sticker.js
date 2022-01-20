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

const { fromBuffer } = require('file-type');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { Image } = require('node-webpmux');
const { Exif } = require('./exif');
const { randomBytes } = require('crypto');
const { isUrl, getBuffer } = require('./index');
//ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

let cropType = {
    'rounded': new Buffer.from('<svg><rect x="0" y="0" width="450" height="450" rx="50" ry="50"/></svg>'),
    'circle': new Buffer.from('<svg height="485" width="485"><circle cx="242.5" cy="242.5" r="242.5" fill="#3a4458"/></svg>'),
}
// some part of this code is copied from:  https://github.com/AlenSaito1/wa-sticker-formatter/ <- awesome library
class Sticker {

    /**
     * let set the sticker metadata
     * @typedef {Object} IStickerMetadata
     * @property {string} packname sticker pack name
     * @property {string} author sticker author
     * @property {string} packId sticker pack id
     * @property {string} categories sticker emoji categories
     */

    /**
     * Build an WebP WAsticker with exif metadata
     * @param {string|Buffer} data File path, url or Buffer of the image/video
     * @param {IStickerMetadata} metadata let set the sticker metadata
     * @param {string} crop crop style [just for image], can be circle | rounded
     */
    constructor(data, metadata, crop) {
        this.data = data
        this.packname = metadata.packname
        this.author = metadata.author
        this.packId = metadata.packId
        this.categories = metadata.categories
        this.crop = crop ?? undefined
    }

    /**
     * process image 
     * @returns {Promise<Buffer>} webp Buffer
     */
    processImage = (input) => {
        return new Promise((resolve, reject) => {
            sharp(input)
                .toFormat('webp')
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .toBuffer()
                .then(resolve)
                .catch(reject)
        })
    }

    /**
     * crop image 
     * @returns {Promise<Buffer>} webp Buffer
     */
    cropImage = (input) => {
        return new Promise((resolve, reject) => {
            sharp(input)
                .toFormat('webp')
                .resize(512, 512)
                .composite([{
                    input: cropType[this.crop],
                    blend: 'dest-in',
                    cutout: true
                }])
                .toBuffer()
                .then(resolve)
                .catch(reject)
        })
    }

    static convertGif = (input) => {
        return new Promise((resolve, reject) => {
            sharp(input)
                .gif()
                .toBuffer()
                .then(resolve)
                .catch(reject)
        })
    }


    /**
     * convert video to webp WASticker format
     * @param {Buffer} data video to be converted
     * @returns {Promise<Buffer} webp Buffer
     */
    processAnimated = async (data) => {
        try {
            const input = `./temp/video_${randomBytes(3).toString('hex')}.mp4`
            const output = `./temp/${randomBytes(3).toString('hex')}.webp`
            fs.writeFileSync(input, data.toString('binary'), 'binary')
            const file = await new Promise((resolve) => {
                ffmpeg(input)
                    .inputOptions(['-y', '-t', '20'])
                    .complexFilter(['scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'])
                    .outputOptions(['-qscale', '50', '-fs', '1M', '-vcodec', 'libwebp', '-preset', 'default', '-loop', '0', '-an', '-vsync', '0'])
                    .format('webp')
                    .save(output)
                    .on('end', () => resolve(output))
            })
            const buffer = fs.readFileSync(file);
            [input, output].forEach((file) => fs.unlinkSync(file))
            return buffer
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * mboh radong
     * @returns {Promise<Buffer} webp Buffer
     */
    cropVideo = async (data) => {
        try {
            const input = `./temp/video_${randomBytes(3).toString('hex')}.mp4`
            const output = `./temp/${randomBytes(3).toString('hex')}.webp`
            fs.writeFileSync(input, data.toString('binary'), 'binary')
            const file = await new Promise((resolve) => {
                ffmpeg(input)
                    .inputOptions(['-y', '-t', '20'])
                    .outputOptions([
                        '-vcodec',
                        'libwebp',
                        '-vf',
                        // eslint-disable-next-line no-useless-escape
                        `crop=w='min(min(iw\,ih)\,500)':h='min(min(iw\,ih)\,500)',scale=500:500,setsar=1,fps=15`,
                        '-loop',
                        '0',
                        '-preset',
                        'default',
                        '-an',
                        '-vsync',
                        '0',
                        '-s',
                        '512:512'
                    ])
                    .format('webp')
                    .save(output)
                    .on('end', () => resolve(output))
            })
            const buffer = fs.readFileSync(file);
            [input, output].forEach((file) => fs.unlinkSync(file))
            return buffer
        } catch (error) {
            console.log(error);
        }
    }

    _parse = async () => {
        return Buffer.isBuffer(this.data)
            ? this.data
            : isUrl(this.data)
                ? (await getBuffer(this.data)).buffer
                : this.data
    }

    /**
     * add metadata to webp buffer
     * @param {Buffer} input webp buffer
     * @returns {Promise<Buffer>}
     */
    addMetadata = async (input) => {
        const data = input || this.data
        const exif = new Exif({ packname: this.packname, author: this.author, packId: this.packId, categories: this.categories }).create();
        const img = new Image()
        await img.load(data)
        img.exif = exif
        return await img.save(null)
    }

    _getMimeType = async (input) => {
        const type = await fromBuffer(input)
        if (!type) {
            if (typeof this.data === 'string') return 'image/svg+xml'
            throw new Error('Invalid file type')
        }
        return type.mime
    }

    /**
     *   
     * @returns {Promise<Buffer>} webp Buffer WASticker
     */
    build = async () => {
        const data = await this._parse()
        const mime = await this._getMimeType(data);
        const isVideo = mime.startsWith('video')
        const media = isVideo
            ? await this.processAnimated(data)
            : this.crop !== undefined
                ? await this.cropImage(data)
                : await this.processImage(data)
        return await this.addMetadata(media)
    }

    /**
     * Get Baileys-MD message object format
     * @returns {Promise<{ sticker: Buffer }>}
     * @example
     * const media = new Sticker(buffer, { packname: 'mg.bot pack', author: '@gimenz.id', packId: '', categories: 'love' })
     * await client.sendMessage(from, await data.toMessage(), { quoted: m })
     */
    toMessage = async () => {
        return ({ sticker: await this.build() })
    }

    /**
     * 
     * @typedef {Object} RawMetadata 
     * @property {Array<string>} emoji WASticker Emoji Categories
     * @property {string} sticker-pack-id WASticker Pack ID
     * @property {string} sticker-pack-name WASticker Pack Name
     * @property {string} sticker-pack-publisher WASticker Pack Author
     */

    /**
     * Extracts metadata from a WebP image.
     * @param {Buffer} input - The image buffer to extract metadata from
     * @returns {Promise<RawMetadata>}
     */
    static async extract(input) {
        const img = new Image()
        await img.load(input)
        const exif = img.exif?.toString('utf-8') ?? '{}'
        return JSON.parse(exif.substring(exif.indexOf('{'), exif.lastIndexOf('}') + 1) ?? '{}')
    }
}

module.exports = {
    Sticker,
    cropType
};
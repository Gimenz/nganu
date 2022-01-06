const { fromBuffer } = require('file-type');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { Image } = require('node-webpmux');
const Exif = require('./exif');
const { getRandom } = require('../lib/function');
const { isUrl } = require('../../wa-md/utils/function');
const { getBuffer } = require('./function');

let type = {
    'rounded': new Buffer.from('<svg><rect x="0" y="0" width="450" height="450" rx="50" ry="50"/></svg>'),
    'circle': new Buffer.from('<svg height="485" width="485"><circle cx="242.5" cy="242.5" r="242.5" fill="#3a4458"/></svg>'),
}

class Sticker {
    /**
     * Build an webp sticker with exif metadata
     * @param {Buffer} data Media buffer 
     * @param {string} crop crop style, can be circle | rounded 
     * @param {string} author sticker author
     * @param {string} packname sticker packname
     * @param {string} packId sticker pack id
     * @param {string} categories sticker emoji categories see ./utils/exif.js
     */
    constructor(data, crop, author, packname, packId, categories) {
        this.data = data
        this.crop = crop
        this.author = author ?? ''
        this.packname = packname ?? ''
        this.packId = packId ?? ''
        this.categories = categories ?? ''
    }

    /**
     * process image 
     * @param {string|Buffer} input buffer
     * @param {string} crop crop image, rounded | circle. default is set to normal(contain)
     * @returns {Promise<Buffer>} webp ArrayBuffer
     */
    processImage = () => {
        return new Promise((resolve, reject) => {
            sharp(this.data)
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
     * @returns {Promise<Buffer>} webp buffer
     */
    cropImage = () => {
        return new Promise((resolve, reject) => {
            sharp(this.data)
                .toFormat('webp')
                .resize(512, 512)
                .composite([{
                    input: type[this.crop],
                    blend: 'dest-in',
                    cutout: true
                }])
                .toBuffer()
                .then(resolve)
                .catch(reject)
        })
    }


    /**
     * convert video to webp WASticker format
     * @param {Buffer} data Buffer
     * @returns {Promise<Buffer} webp Buffer
     */
    processAnimated = async () => {
        try {
            const input = `./temp/video_${getRandom('mp4')}`
            const output = `./temp/${Math.random().toString(36)}.webp`
            fs.writeFileSync(input, this.data.toString('binary'), 'binary')
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
     * add metadata to webp buffer
     * @param {Buffer} input webp buffer
     * @returns {Promise<Buffer>}
     */
    addMetadata = async (input) => {
        let image = input || this.data
        const exif = new Exif().set(this.packname, this.author, this.packId, this.categories);
        const img = new Image()
        await img.load(image)
        img.exif = exif
        return await img.save(null)
    }

    _getMimeType = async () => {
        const type = await fromBuffer(this.data)
        if (!type) {
            if (typeof this.data === 'string') return 'image/svg+xml'
            throw new Error('Invalid file type')
        }
        return type.mime
    }

    /**
     * 
     * @param {Buffer} data buffer
     * @param {string} crop if is image, can resize with rounded | circle  
     * @returns {Promise<Buffer>}
     */
    build = async () => {
        const mime = await this._getMimeType(this.data);
        const isVideo = mime.startsWith('video')
        const media = isVideo
            ? await this.processAnimated(this.data)
            : typeof this.crop !== undefined
                ? await this.cropImage()
                : await this.processImage()
        return await this.addMetadata(media)
    }

    /**
     * Get Baileys-MD message object format
     * @returns {Promise<{ sticker: Buffer }>}
     * @example
     * const media = new Sticker(buffer, '', '@gimenz.id', 'mg.bot', '', 'love')
     * await client.sendMessage(from, await data.toMessage(), { quoted: m })
     */
    toMessage = async () => {
        return ({ sticker: await this.build() })
    }

    static extract() {

    }
}

module.exports = Sticker;
const { default: axios } = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { JSDOM } = require('jsdom');

class EzGif {
    constructor() { }

    /**
     * Upload file to ezgif server
     * @param {string} path file path
     * @param {string|'webp-to-mp4'} converter example: webp-to-mp4 => for converting webp file to mp4
     */
    async upload(path, converter) {
        const form = new FormData()
        form.append('new-image-url', '')
        form.append('new-image', fs.createReadStream(path))

        const { data } = await axios({
            method: 'POST',
            url: 'https://s6.ezgif.com/' + converter,
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`
            }
        })

        let dom = new JSDOM(data).window.document
        let res = {
            file: dom.querySelector('input[name="file"]').getAttribute('value'),
            convert: dom.querySelector('input[name="convert"]').getAttribute('value')
        }

        return res
    }

    /**
     * Convert it
     * @param {string} file uploaded file
     * @param {string|'webp-to-mp4'} converter example: webp-to-mp4 => for converting webp file to mp4
     * @param {string} convert convert text button!
     * @returns 
     */
    async convert(file, converter, convert) {
        const form = new FormData();
        form.append('file', file)
        form.append('convert', convert)

        const { data } = await axios({
            method: 'POST',
            url: `https://ezgif.com/${converter}/${file}`,
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`
            }
        })

        let dom = new JSDOM(data).window.document

        return 'https:' + dom.querySelector('#output > p.outfile > video > source').getAttribute('src')
    }

    /**
     * Convert WebP file into mp4
     * @param {string} file file path
     * @returns 
     */
    async WebP2mp4(file) {
        const upload = await this.upload(file, 'webp-to-mp4');
        return await this.convert(upload.file, 'webp-to-mp4', upload.convert)

    }
}

module.exports = EzGif
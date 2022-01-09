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

const { randomBytes } = require('crypto');

const Emoji = {
    'love': ['❤', '😍', '😘', '💕', '😻', '💑', '👩‍❤‍👩', '👨‍❤‍👨', '💏', '👩‍❤‍💋‍👩', '👨‍❤‍💋‍👨', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '💋', '👩‍❤️‍💋‍👩', '👨‍❤️‍💋‍👨', '👩‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨', '👩‍❤️‍💋‍👨', '👬', '👭', '👫', '🥰', '😚', '😙', '👄', '🌹', '😽', '❣️', '❤️'],
    'happy': ['😀', ' 😃', ' 😄', ' 😁', ' 😆', ' 😅', ' 😂', ' 🤣', ' 🙂', ' 😛', ' 😝', ' 😜', ' 🤪', ' 🤗', ' 😺', ' 😸', ' 😹', ' ☺', ' 😌', ' 😉', ' 🤗', ' 😊'],
    'sad': ['☹', ' 😣', ' 😖', ' 😫', ' 😩', ' 😢', ' 😭', ' 😞', ' 😔', ' 😟', ' 😕', ' 😤', ' 😠', ' 😥', ' 😰', ' 😨', ' 😿', ' 😾', ' 😓', ' 🙍‍♂', ' 🙍‍♀', ' 💔', ' 🙁', ' 🥺', ' 🤕', ' ☔️', ' ⛈', ' 🌩', ' 🌧'],
    'angry': ['😯', ' 😦', ' 😧', ' 😮', ' 😲', ' 🙀', ' 😱', ' 🤯', ' 😳', ' ❗', ' ❕', ' 🤬', ' 😡', ' 😠', ' 🙄', ' 👿', ' 😾', ' 😤', ' 💢', ' 👺', ' 🗯️', ' 😒', ' 🥵'],
    'greet': ['👋'],
    'celebrate': ['🎊', ' 🎉', ' 🎁', ' 🎈', ' 👯‍♂️', ' 👯', ' 👯‍♀️', ' 💃', ' 🕺', ' 🔥', ' ⭐️', ' ✨', ' 💫', ' 🎇', ' 🎆', ' 🍻', ' 🥂', ' 🍾', ' 🎂', ' 🍰']
}

class Exif {
    /**
     * let set the sticker metadata
     * @typedef {Object} IStickerMetadata
     * @property {string} packname sticker pack name
     * @property {string} author sticker author
     * @property {string} packId sticker pack id
     * @property {string} categories sticker emoji categories
     */

    /**
     * create exif
     * @param {IStickerMetadata} metadata WASticker Metadata
     * @example
     * const exif = new Exif({ packname: 'mg pack', author: '@gimenz.id', packId: 'nganu' })
     * exif.create()
     */
    constructor(metadata) {
        this.packname = metadata.packname
        this.author = metadata.author
        this.packId = metadata.packId || randomBytes(32).toString('hex')
        this.categories = Emoji[metadata.categories] || Emoji['love']
    }
    /**
     * create exif
     * @returns {Buffer} exif buffer
     */
    // part of this code is copied from https://github.com/pedroslopez/whatsapp-web.js/pull/527/files
    create() {
        const json = {
            'sticker-pack-name': this.packname,
            'sticker-pack-publisher': this.author,
            'sticker-pack-id': this.packId,
            'emojis': this.categories
        };
        let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        let exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        return exif;
    }
}

module.exports = {
    Exif,
    Emoji
};
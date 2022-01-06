const fs = require('fs')


/**
 * @class Exif
 */
module.exports = class Exif {
    constructor() { }

    generateHash(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


    set(packname, author, packId, categories = ['']) {
        const json = {
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
            'sticker-pack-id': packId || this.generateHash(32),
            'emojis': categories
        };
        let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        let exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        // fs.writeFile(`./media/${filename}.exif`, exif, (err) => {
        //     if (err) return console.error(err)
        // })
        return exif;
    }

    categories = {
        'love': ['❤', '😍', '😘', '💕', '😻', '💑', '👩‍❤‍👩', '👨‍❤‍👨', '💏', '👩‍❤‍💋‍👩', '👨‍❤‍💋‍👨', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '💋', '👩‍❤️‍💋‍👩', '👨‍❤️‍💋‍👨', '👩‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨', '👩‍❤️‍💋‍👨', '👬', '👭', '👫', '🥰', '😚', '😙', '👄', '🌹', '😽', '❣️', '❤️'],
        'happy': ['😀', ' 😃', ' 😄', ' 😁', ' 😆', ' 😅', ' 😂', ' 🤣', ' 🙂', ' 😛', ' 😝', ' 😜', ' 🤪', ' 🤗', ' 😺', ' 😸', ' 😹', ' ☺', ' 😌', ' 😉', ' 🤗', ' 😊'],
        'sad': ['☹', ' 😣', ' 😖', ' 😫', ' 😩', ' 😢', ' 😭', ' 😞', ' 😔', ' 😟', ' 😕', ' 😤', ' 😠', ' 😥', ' 😰', ' 😨', ' 😿', ' 😾', ' 😓', ' 🙍‍♂', ' 🙍‍♀', ' 💔', ' 🙁', ' 🥺', ' 🤕', ' ☔️', ' ⛈', ' 🌩', ' 🌧'],
        'angry': ['😯', ' 😦', ' 😧', ' 😮', ' 😲', ' 🙀', ' 😱', ' 🤯', ' 😳', ' ❗', ' ❕', ' 🤬', ' 😡', ' 😠', ' 🙄', ' 👿', ' 😾', ' 😤', ' 💢', ' 👺', ' 🗯️', ' 😒', ' 🥵'],
        'greet': ['👋'],
        'celebrate': ['🎊', ' 🎉', ' 🎁', ' 🎈', ' 👯‍♂️', ' 👯', ' 👯‍♀️', ' 💃', ' 🕺', ' 🔥', ' ⭐️', ' ✨', ' 💫', ' 🎇', ' 🎆', ' 🍻', ' 🥂', ' 🍾', ' 🎂', ' 🍰']
    }
}

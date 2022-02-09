const { default: axios } = require('axios')
const emojiRegex = require('emoji-regex');
const fs = require('fs')
const _ = require('lodash')
let emojiList = fs.readFileSync('./src/emojis.txt', 'utf-8')

const mix = async (emoji1, emoji2) => {
    let api = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${emoji2 ? encodeURIComponent(emoji1 + '_' + emoji2) : encodeURIComponent(emoji1)}`
    const res = await axios.get(api)
    return res.data
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
const parseEmoji = (str) => {
    let emojis = emojiList.split('\n').map(v => v.codePointAt(0))
    // let emojis = str.matchAll(emojiRegex())
    // let foundEmojis = []
    // for (const emojiData of emojis) {
    //     const match = str.matchAll(new RegExp(emojiData, 'g'))
    //     console.log(match);
    //     if (match) {
    //         foundEmojis = [...foundEmojis, ...match.map(() => emojiData)]
    //     }
    // }
    const regex = emojiRegex();
    let found = []
    for (const e of str.matchAll(regex)) {
        const emoji = e[0].codePointAt(0);
        const match = emojis.includes(emoji)
        if (match) {
            found.push(String.fromCodePoint('0x' + emoji.toString(16)))
        }
    }
    return found
}

const toHex = (str) => str.codePointAt(0).toString(16)
const toString = (hex) => String.fromCodePoint('0x' + hex)
const shuffle = () => {
    return [_.sample(emojiList), _.sample(emojiList)]
}

module.exports = {
    mix,
    parseEmoji,
    toHex,
    toString,
    shuffle
}


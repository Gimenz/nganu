/**
 * this code are recoded from: https://github.com/SimonLeclere/quotesGen/blob/master/instagram%20autoposter/index.js
 * 
 */

const canvas = require('canvas')
const { createCanvas, loadImage, registerFont } = canvas;
const path = require('path')
const fs = require('fs')
let fonts = fs.readdirSync('./src/font')

fonts.map(x => {
    const fontName = x.substring(0, x.lastIndexOf("."))
    registerFont(path.join('./src/font', x), { family: fontName })
})

// kata = 'jarene mbah jambrong, yen wayah subuh ngeneiki kon diakehi le dzikir, ora malah mbokep sing iso nambahi dosomu kui'
// wm = '~ mbahjambrong'

// drawImage(kata, wm, 'bg.jpg').then(canvas => {
//     // save as jpeg
//     const out = fs.createWriteStream(__dirname + '/out.jpg');
//     const stream = canvas.createJPEGStream();
//     stream.pipe(out);
//     out.on('finish', async () => {
//         console.log('dpe');
//     });
// })

/**
 * 
 * @param {string} quoteString 
 * @param {string} wm 
 * @param {string|Buffer} background 
 * @returns 
 */
async function drawImage(quoteString, wm, background) {
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext('2d')

    return loadImage(background).then((image) => {
        const imgSize = Math.min(image.width, image.height);

        const left = (image.width - imgSize) / 2;
        const top = (image.height - imgSize) / 2;

        ctx.drawImage(image, left, top, imgSize, imgSize, 0, 0, ctx.canvas.width, ctx.canvas.height);

        // Dessine un rectangle noir transparent sur l'image
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Dessine le texte le plus gros possible au centre de l'image, avec un padding de 10px et des retours à la ligne

        ctx.font = `33px Nineteen Second`;

        // ctx.font = 'bold 100px "Helvetica Neue", Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        // ctx.shadowColor = "black";
        // ctx.shadowOffsetX = 2;
        // ctx.shadowOffsetY = 2;
        // ctx.shadowBlur = 10;

        wrapText(ctx, quoteString, ctx.canvas.width / 2, ctx.canvas.height * 0.45, ctx.canvas.width - (ctx.canvas.width / 3.5), 50);

        ctx.font = `22px NunitoSans-Italic`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText(wm, ctx.canvas.width / 2, ctx.canvas.height * 0.78)

        return canvas;
    })
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);

            // const temp = ctx.fillStyle;
            // ctx.fillStyle = 'black';
            // ctx.strokeText(line, x, y);
            // ctx.fillStyle = temp;

            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);

    // const temp = ctx.fillStyle;
    // ctx.fillStyle = 'black';
    // ctx.strokeText(line, x, y);
    // ctx.fillStyle = temp;
}

module.exports = { drawImage }
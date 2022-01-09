const { download } = require("./lib/function");

const { toGif, toAudio } = require("./lib/converter");
const fs = require('fs')
// toAudio('https://video.twimg.com/ext_tw_video/1353755948385329152/pu/vid/1280x720/Iw2eWMR3NqtjZe3D.mp4?tag=10').then(res => {
//     console.log(res);
// })

// toGif(fs.readFileSync('./temp/1641717706672.gif'))
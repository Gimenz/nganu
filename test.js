const fs = require('fs');
const { bgColor, color } = require('./utils/function');
let user = JSON.parse(fs.readFileSync('./db/users.json', 'utf-8'))


function addUser(array, userId) {
    if (!array.some((x => x == userId))) {
        nganu = '1232132'
        array.push(userId)
        fs.writeFileSync('./db/users.json', JSON.stringify(array), 'utf-8')
    }
}

if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp')
}


const hatimu = 'wong liyo';
new RegExp('adakah aku dihatimu 🥺', 'i').test(hatimu);
// false
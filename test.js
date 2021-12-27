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

const { igApi } = require('insta-fetcher');
const ig = new igApi(`50998513903%3AuZuwz5gmzih919%3A7`)

ig.fetchHighlights('linda_darmawan03').then(res => console.log(res)).catch(e => console.log(e))
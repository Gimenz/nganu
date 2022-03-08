const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

var db = new JsonDB(new Config("db/db", true, true, '/'));

let stats = {
    msgSent: 1,
    msgRecv: 1,
    filesize: 1,
    autodownload: 1,
    sticker: 1,
    cmd: 1
}
if (!db.exists('/stats')) db.push('/stats', stats)

/**
 * 
 * @param {string} prop 
 * @param {Number} count 
 */
function statistics(prop, count = 1) {
    if (!db.exists(`/stats/${prop}`)) db.push(`/stats/${prop}`, count)
    let stat = db.getData(`/stats/${prop}`)
    db.push(`/stats/${prop}`, stat += count)
}

function info(path) {
    if (!db.exists(path)) throw `db ${path} not exists`
    return db.getData(path)
}

module.exports = {
    statistics,
    info
}
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
if (!db.exists('/groups')) db.push('/groups/123-456@g.us', {
    id: '123-456@g.us',
    groupName: 'jirolu',
    antilink: false,
    mute: false
})
if (!db.exists('/afk')) db.push('/afk[]', { jid: '123@c.us', groupId: '123-456@g.us', groupName: 'jirolu', timestamp: Date.now(), reason: 'ngising' })

/**
 * 
 * @param {string} prop 
 * @param {Number} count 
 */
exports.statistics = (prop, count = 1) => {
    if (!db.exists(`/stats/${prop}`)) db.push(`/stats/${prop}`, count)
    let stat = db.getData(`/stats/${prop}`)
    db.push(`/stats/${prop}`, stat += count)
}

exports.info = (path) => {
    if (!db.exists(path)) throw `db ${path} not exists`
    return db.getData(path)
}

exports.groupManage = {
    add: (groupId, groupName) => {
        if (db.exists(`/groups/${groupId}`)) return false
        let json = {
            id: groupId,
            groupName,
            antilink: false,
            mute: false,
            welcome: {
                status: true,
                msg: 'Welcome @user in group {title}'
            },
            leave: {
                status: true,
                msg: 'Good bye @user'
            }
        }
        db.push(`/groups/${groupId}`, json)
    },
    update: (groupId, args) => {
        db.push(`/groups/${groupId}`, args)
    },
    get: (groupId) => {
        return db.getData(`/groups/${groupId}`)
    }

}

exports.AFK = {
    /**
     * 
     * @param {string} jid 
     * @param {string} groupId 
     * @param {string} groupName 
     * @param {moment.Moment} timestamp 
     * @param {string} reason 
     */
    add: (jid, groupId, groupName, timestamp, reason) => {
        let stat = db.getData('/afk')
        if (!stat.some(x => x.jid == jid) || !stat.some(x => x.groupId == groupId)) {
            db.push('/afk[]', {
                jid,
                groupId,
                groupName,
                timestamp,
                reason,
            })
        }
    },
    update: (jid, groupId, timestamp, reason) => {
        let stat = db.getData('/afk')
        let index = stat.findIndex(x => x.jid == jid && x.groupId == groupId)
        if (stat.some(x => x.jid == jid) || stat.some(x => x.groupId == groupId)) {
            db.push(`/afk[${index}]`, {
                jid,
                groupId,
                timestamp,
                reason
            })
        }
    },
    check: (jid, groupId) => {
        let stat = db.getData('/afk')
        let i = stat.some(x => x.jid == jid && x.groupId == groupId)
        return i
    },
    get: (jid, groupId) => {
        let stat = db.getData('/afk')
        let index = stat.find(x => x.jid == jid && x.groupId == groupId)
        return index
    },
    delete: (jid, groupId) => {
        let stat = db.getData('/afk')
        let index = stat.findIndex(x => x.jid == jid && x.groupId == groupId)
        db.delete(`/afk[${index}]`)
    },
    getAll: () => {
        return db.getData('/afk')
    }
}
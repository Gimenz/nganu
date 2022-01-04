let express = require('express')
const http = require('http')
const app = express()
const httpServer = http.createServer(app)
const osUtils = require('node-os-utils')
const os = require('os')
const { color } = require('./utils/function')
const io = require('socket.io')(httpServer)

const webLog = async (client) => {
    // View Engine and static public folder
    app.set('view engine', 'ejs')
    app.use(express.static('./views'))

    // Root Route
    app.get('/', (req, res) => {
        res.render('index.ejs')
    })

    // CPU USAGE
    const cpu = osUtils.cpu

    // USER and OS
    const username = os.userInfo().username
    const osInfo = os.type()
    io.sockets.setMaxListeners(0);
    // SOCKET IO
    io.on('connection', (socket) => {
        console.log(color(`[INFO] ${socket.id} Server socket connected`, 'green'))
        // USE SET INTERVAL TO CHECK RAM USAGE EVERY SECOND
        setInterval(async () => {
            // RAM USED tot - free
            const ramUsed = Math.round(os.totalmem()) - Math.round(os.freemem())
            // RAM percentage
            const ram = (ramUsed * 100 / Math.round(os.totalmem())).toFixed(0)
            /** Bot run time */
            const runtime = Math.round(process.uptime()).toFixed(0)
            /** Computer system uptime  */
            const uptime = Math.round(os.uptime()).toFixed(0)


            // CPU USAGE PERCENTAGE
            cpu.usage().then((cpu) => socket.emit('ram-usage', { ram, cpu, username, osInfo, runtime, uptime, logger }))
        }, 1000)
    })

    // Run the server
    const PORT = process.env.PORT || 3000
    httpServer.listen(PORT, () => {
        console.log(color('[INFO] Web api Server on port: ', 'green') + color(`${PORT}`, 'yellow'))
    })
}

const logger = (client) => {
    let loging
    if (!client.isGroupMsg && client.isCmd) loging = `# <span style="color:#FFA500;font-weight:bold">${client.time}</span> <span style="background-color:#00FA9A;">${client.prefix}${client.cmd}</span> [${client.args.join(' ')}] from ${client.pushname}`
    if (!client.isGroupMsg && !client.isCmd) loging = `# <span style="color:#FFA500;font-weight:bold">${client.time}</span>  <span style="background-color:#7FFFD4;">${client.msgType}</span> - ${cut(client.body)} from ${client.pushname}`
    if (client.isCmd && client.isGroupMsg) loging = `# <span style="color:#FFA500;font-weight:bold">${client.time}</span>  <span style="background-color:#00FA9A;">${client.prefix}${client.cmd}</span> [${client.args.join(' ')}] from ${client.pushname} in [ ${client.groupName} ]`
    if (!client.isCmd && client.isGroupMsg) loging = `# <span style="color:#FFA500;font-weight:bold">${client.time}</span>  <span style="background-color:#7FFFD4;">${client.msgType}</span> - ${cut(client.body)} from ${client.pushname} in Group [ ${client.groupName} ]`
    io.emit('log', { loging })
}

function cut(message) {
    if (message.length >= 10) {
        return `${message.substr(0, 100)}`;
    } else {
        return `${message}`;
    }
};

module.exports = {
    webLog,
    logger
}

/**
 * Author  : Gimenz
 * Name    : nganu
 * Version : 1.0
 * Update  : 08 Januari 2022
 * 
 * If you are a reliable programmer or the best developer, please don't change anything.
 * If you want to be appreciated by others, then don't change anything in this script.
 * Please respect me for making this tool from the beginning.
 */
require('dotenv').config()
const {
    default: makeWASocket,
    DisconnectReason,
    useSingleFileAuthState,
    Browsers,
    isJidGroup,
    makeInMemoryStore,
    jidNormalizedUser,
    fetchLatestBaileysVersion,
    getContentType
} = require('@adiwajshing/baileys');
const { Boom } = require('./node_modules/@hapi/boom')
const _ = require('lodash')
const pino = require('pino');
const CFonts = require('cfonts');
const gradient = require('gradient-string');
let package = require('./package.json');
const yargs = require('yargs/yargs')
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.config = require('./src/config.json')
global.API = config.api
global.owner = config.owner
global.footer = `© ${package.name} ${new Date().getFullYear()}`
const { SID } = require('sid-api')
global.sID = new SID(process.env.sid_email, process.env.sid_password);
let session;
if (opts['server']) require('./server')
if (opts['test']) {
    session = './test-session.json'
} else {
    session = './session.json'
}
const { state, saveState } = useSingleFileAuthState(session);

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
store.readFromFile('./db/baileys_store_multi.json')
// save every 10s
setInterval(() => {
    store.writeToFile('./db/baileys_store_multi.json')
}, 10_000)

global.store = store

/** LOCAL MODULE */
const {
    color,
    bgColor,
    msgs,
    pluginLoader,
} = require('./utils');
const { Serialize } = require('./lib/simple');
const cmdMSG = require('./src/cmdMessage.json');
const { statistics } = require('./db');

/** DB */
if (!fs.existsSync('./db/usersJid.json')) {
    fs.writeFileSync('./db/usersJid.json', JSON.stringify([]), 'utf-8')
}

let chatsJid = JSON.parse(fs.readFileSync('./db/usersJid.json', 'utf-8'))
global.shortenerAuth = process.env.sid_email !== '' && process.env.sid_password !== ''
const START_TIME = Date.now();
fs.writeFileSync('./src/start.txt', START_TIME.toString())

const start = async () => {
    // LOAD PLUGINS
    let commands = pluginLoader('../handlers/commands')
    let events = pluginLoader('../handlers/events')
    global.plugins = Object.assign(commands, events)
    CFonts.say(`${package.name}`, {
        font: 'shade',
        align: 'center',
        gradient: ['#12c2e9', '#c471ed'],
        transitionGradient: true,
        letterSpacing: 3,
    });
    CFonts.say(`'${package.name}' Coded By ${package.author}`, {
        font: 'console',
        align: 'center',
        gradient: ['#DCE35B', '#45B649'],
        transitionGradient: true,
    });
    const { version: WAVersion } = await fetchLatestBaileysVersion()
    console.log(color('[SYS]', 'cyan'), `Package Version`, color(`${package.version}`, '#009FF0'));
    console.log(color('[SYS]', 'cyan'), `WA Version`, color(WAVersion.join('.'), '#38ef7d'));
    console.log(color('[SYS]', 'cyan'), `Loaded Plugins`, color(Object.keys(plugins).length, '#38ef7d'));
    const LAUNCH_TIME_MS = Date.now() - START_TIME;
    console.log(
        color('[SYS]', 'cyan'),
        `Client loaded with ${color(Object.keys(store.contacts).length, '#009FF0')} contacts, ` +
        `${color(store.chats.length, '#009FF0')} chats, ` +
        `${color(Object.keys(store.messages).length, '#009FF0')} messages in ` +
        `${color(LAUNCH_TIME_MS / 1000, '#38ef7d')}s`
    );
    let client = makeWASocket({
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.macOS('Safari')
    });
    global.client = client

    client.ev.on('connection.update', async (update) => {
        if (global.qr !== update.qr) {
            global.qr = update.qr
        }

        const { connection, lastDisconnect } = update;
        if (connection === 'connecting') {
            console.log(color('[SYS]', '#009FFF'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(`${package.name} is Authenticating...`, '#f12711'));
        } else if (connection === 'close') {
            const log = msg => console.log(color('[SYS]', '#009FFF'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(msg, '#f64f59'));
            const statusCode = lastDisconnect.error ? new Boom(lastDisconnect)?.output.statusCode : 0;

            console.log(lastDisconnect.error);
            if (statusCode === DisconnectReason.badSession) { log(`Bad session file, delete ${session} and run again`); start(); }
            else if (statusCode === DisconnectReason.connectionClosed) { log('Connection closed, reconnecting....'); start() }
            else if (statusCode === DisconnectReason.connectionLost) { log('Connection lost, reconnecting....'); start() }
            else if (statusCode === DisconnectReason.connectionReplaced) { log('Connection Replaced, Another New Session Opened, Please Close Current Session First'); process.exit() }
            else if (statusCode === DisconnectReason.loggedOut) { log(`Device Logged Out, Please Delete ${session} and Scan Again.`); process.exit(); }
            else if (statusCode === DisconnectReason.restartRequired) { log('Restart required, restarting...'); start(); }
            else if (statusCode === DisconnectReason.timedOut) { log('Connection timedOut, reconnecting...'); start(); }
            else {
                console.log(lastDisconnect.error); start()
            }
        } else if (connection === 'open') {
            console.log(color('[SYS]', '#009FFF'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(`${package.name} is now Connected...`, '#38ef7d'));
        }
    });

    client.ev.on('creds.update', () => saveState)

    store.bind(client.ev)

    client.ev.on('messages.upsert', async (msg) => {
        try {
            if (!msg.messages) return
            const m = msg.messages[0]
            if (m.key.fromMe) {
                statistics('msgSent')
            } else {
                statistics('msgRecv')
            }
            if (m.key.fromMe) return
            const from = m.key.remoteJid;
            let type = client.msgType = getContentType(m.message);
            Serialize(client, m)
            let t = client.timestamp = m.messageTimestamp
            const body = (type === 'conversation') ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.listResponseMessage.singleSelectReply.selectedRowId || m.message.buttonsResponseMessage.selectedButtonId || m.text) : ''

            let isGroupMsg = isJidGroup(from)
            let sender = m.sender
            const isOwner = config.owner.includes(sender)
            let pushname = client.pushname = m.pushName
            const botNumber = client.user.id
            const groupId = isGroupMsg ? from : ''
            let groupMetadata = isGroupMsg ? await client.groupMetadata(groupId) : {}
            let groupMembers = isGroupMsg ? groupMetadata.participants : []
            let groupAdmins = groupMembers.filter(v => v.admin !== null).map(x => x.id)
            let isGroupAdmin = groupAdmins.includes(sender)
            let isBotGroupAdmin = groupAdmins.includes(jidNormalizedUser(botNumber))
            let formattedTitle = isGroupMsg ? groupMetadata.subject : ''

            // let _plugin = []
            // for (let _pluginName in plugins) {
            //     let filtered = plugins[_pluginName]
            //     _plugin.push(filtered)
            // }
            // const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

            global.prefix = /^[./~!#%^&=\,;:()]/.test(body) ? body.match(/^[./~!#%^&=\,;:()]/gi) : '#'
            // let cPrefix = _plugin.filter(x => x.customPrefix && x.cmd).map(x => x.cmd).flat(2)
            // let _prefix = cPrefix.filter(x => new RegExp(str2Regex(x)).test(body)).length ? cPrefix.filter(x => new RegExp(str2Regex(x)).test(body))[0] : global.prefix
            const arg = body.substring(body.indexOf(' ') + 1)
            let args = body.trim().split(/ +/).slice(1);
            let flags = [];
            let isCmd = client.isCmd = body.startsWith(global.prefix);
            let cmd = client.cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null
            let url = args.length !== 0 ? args[0] : '';

            for (let i of args) {
                if (i.startsWith('--')) flags.push(i.slice(2).toLowerCase())
            }

            const logEvent = (text) => {
                if (!isGroupMsg) {
                    console.log(bgColor(color('[EXEC]', 'black'), '#38ef7d'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), gradient.summer(`[${text}]`), bgColor(color(type, 'black'), 'cyan'), '~> from', gradient.cristal(pushname))
                }
                if (isGroupMsg) {
                    console.log(bgColor(color('[EXEC]', 'black'), '#38ef7d'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), gradient.summer(`[${text}]`), bgColor(color(type, 'black'), 'cyan'), '~> from', gradient.cristal(pushname), 'in', gradient.fruit(formattedTitle))
                }
            }

            // store user jid to json file
            if (isCmd) {
                if (isGroupMsg) {
                    if (!chatsJid.some((x => x == from))) {
                        chatsJid.push(from)
                        fs.writeFileSync('./db/usersJid.json', JSON.stringify(chatsJid), 'utf-8')
                    }
                }
                if (!chatsJid.some((x => x == sender))) {
                    chatsJid.push(sender)
                    fs.writeFileSync('./db/usersJid.json', JSON.stringify(chatsJid), 'utf-8')
                }
            }

            let tipe = bgColor(color(type, 'black'), '#FAFFD1')
            if (!isCmd && !isGroupMsg) {
                console.log('[MSG]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), msgs(m.text), `~> ${(tipe)} from`, color(pushname, '#38ef7d'))
            }
            if (!isCmd && isGroupMsg) {
                console.log('[MSG]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), msgs(m.text), `~> ${tipe} from`, color(pushname, '#38ef7d'), 'in', gradient.morning(formattedTitle))
            }
            if (isCmd && !isGroupMsg) {
                console.log(color('[CMD]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(`${cmd} [${args.length}]`), color(`${msgs(body)}`, 'cyan'), '~> from', gradient.teen(pushname, 'magenta'))
            }
            if (isCmd && isGroupMsg) {
                console.log(color('[CMD]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(`${cmd} [${args.length}]`), color(`${msgs(body)}`, 'cyan'), '~> from', gradient.teen(pushname), 'in', gradient.fruit(formattedTitle))
            }

            if (isCmd && config.composing) {
                await client.presenceSubscribe(from)
                await client.sendPresenceUpdate('composing', from)
            }

            if (config.autoRead) {
                client.sendReadReceipt(from, sender, [m.key.id])
            }

            for (let name in plugins) {
                let plugin = plugins[name]

                if (plugin.cmd && plugin.cmd.includes(cmd) && !m.isBot) {
                    let turn = plugin.cmd instanceof Array
                        ? plugin.cmd.includes(cmd)
                        : plugin.cmd instanceof String
                            ? plugin.cmd == cmd
                            : false
                    if (!turn) continue
                    if (typeof plugin.admin != 'undefined' && plugin.admin && !isGroupAdmin && isGroupMsg) {
                        m.reply(cmdMSG.notGroupAdmin)
                        continue
                    } else if (typeof plugin.botAdmin != 'undefined' && plugin.botAdmin && !isBotGroupAdmin && isGroupMsg) {
                        m.reply(cmdMSG.botNotAdmin)
                        continue
                    } else if (typeof plugin.group != 'undefined' && plugin.group && !isGroupMsg) {
                        m.reply(cmdMSG.groupMsg)
                        continue
                    } else if (typeof plugin.owner != 'undefined' && plugin.owner && !isOwner) {
                        m.reply(cmdMSG.owner)
                        continue
                    }
                    await plugin.exec(m, client, { body, prefix, args, arg, cmd, url, flags, msg, plugins })
                    statistics('cmd')
                    break
                } else if (plugin.regex instanceof RegExp && plugin.regex.test(body) && !m.isBot) {
                    logEvent(body.match(plugin.regex)[0])
                    await plugin.exec(m, client, { body, logEvent, prefix, args, cmd, url })
                    statistics('autodownload')
                } else if (plugin.startsWith && body.startsWith(plugin.startsWith) && !m.isBot) {
                    if (typeof plugin.owner != 'undefined' && plugin.owner && !isOwner) return
                    if (typeof plugin.admin != 'undefined' && plugin.admin && !isGroupAdmin) return
                    if (typeof plugin.botAdmin != 'undefined' && plugin.botAdmin && !isBotGroupAdmin) return
                    if (typeof plugin.group != 'undefined' && plugin.group && !isGroupMsg) return
                    await plugin.exec(m, client, { body, prefix, args, arg, cmd, url, flags, msg, plugins })
                    statistics('cmd')
                }
            }

        } catch (error) {
            console.log(color('[ERROR]', 'red'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), error);
        }
    })
};

start().catch(() => start());
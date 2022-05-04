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
    getContentType,
    jidDecode,
    delay
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
    Scandir,
    isLatestVersion,
} = require('./utils');
const { Serialize } = require('./lib/simple');
const cmdMSG = require('./src/cmdMessage.json');
const { statistics, groupManage } = require('./db');

/** DB */
if (!fs.existsSync('./db/usersJid.json')) {
    fs.writeFileSync('./db/usersJid.json', JSON.stringify([]), 'utf-8')
}

let chatsJid = JSON.parse(fs.readFileSync('./db/usersJid.json', 'utf-8'))
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
    const { version: WAVersion, isLatest } = await fetchLatestBaileysVersion()
    let pkg = await isLatestVersion()
    console.log(color('[SYS]', 'cyan'), `Package Version`, color(`${package.version}`, '#009FF0'), 'Is Latest :', color(`${pkg.isLatest}`, '#f5af19'));
    console.log(color('[SYS]', 'cyan'), `WA Version`, color(WAVersion.join('.'), '#38ef7d'), 'Is Latest :', color(`${isLatest}`, '#f5af19'));
    console.log(color('[SYS]', 'cyan'), `Loaded Plugins ${color(Object.keys(plugins).length, '#38ef7d')} of ${color(Scandir('./handlers').length, '#f5af19')}`);
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
        browser: Browsers.macOS('Firefox')
    });
    global.client = client

    store?.bind(client.ev)

    client.ev.on('connection.update', async (update) => {
        if (global.qr !== update.qr) {
            global.qr = update.qr
        }

        const { connection, lastDisconnect } = update;
        if (connection === 'connecting') {
            console.log(color('[SYS]', '#009FFF'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(`${package.name} is Authenticating...`, '#f12711'));
        } else if (connection === 'close') {
            const log = msg => console.log(color('[SYS]', '#009FFF'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(msg, '#f64f59'));
            const statusCode = new Boom(lastDisconnect?.error)?.output.statusCode;

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

    // Handling groups update
    client.ev.on('group-participants.update', async (anu) => {
        try {
            const botNumber = client.user.id
            let jid = anu.id;
            let meta = await client.groupMetadata(jid)
            let participants = anu.participants

            let json = groupManage.get(jid)

            if (json.welcome.status) {
                for (let x of participants) {
                    if (x == botNumber) return
                    let dp;
                    try {
                        dp = await client.profilePictureUrl(x, 'image')
                    } catch (error) {
                        dp = 'https://telegra.ph/file/3ccf9d18530dca4666801.jpg'
                    }
                    let textAdd = json.welcome.msg.replace('@user', `@${jidDecode(x).user}`).replace('{title}', meta.subject)
                    let textRemove = json.leave.msg.replace('@user', `@${jidDecode(x).user}`).replace('{title}', meta.subject)

                    if (anu.action == 'add' && json.welcome.status) {
                        if (textAdd.includes('{foto}')) {
                            client.sendMessage(jid, { image: { url: dp }, mentions: [x], caption: textAdd.replace('{foto}', '') })
                        } else {
                            client.sendMessage(jid, { text: textAdd, mentions: [x] })
                        }
                    } else if (anu.action == 'remove' && json.leave.status) {
                        if (textRemove.includes('{foto}')) {
                            client.sendMessage(jid, { image: { url: dp }, mentions: [x], caption: textRemove.replace('{foto}', '') })
                        } else {
                            client.sendMessage(jid, { text: textRemove, mentions: [x] })
                        }
                    } else if (anu.action == 'promote') {
                        client.sendMessage(jid, { image: { url: dp }, mentions: [x], caption: `Selamat @${x.split('@')[0]} atas jabatan menjadi admin di *${meta.subject}*` })
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    })

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
            if (config.a) {
                client.sendReadReceipt(m.key.remoteJid, m.key.participant, [m.key.id])
            }
            if (m.key && isJidStatusBroadcast(m.key.remoteJid)) return
            const from = m.key.remoteJid;
            let type = client.msgType = getContentType(m.message);
            Serialize(client, m)
            let t = client.timestamp = m.messageTimestamp
            const body = (type === 'conversation') ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.listResponseMessage.singleSelectReply.selectedRowId || m.message.buttonsResponseMessage.selectedButtonId || m.text) : ''

            let isGroupMsg = isJidGroup(m.chat)
            let sender = m.sender
            const isOwner = config.owner.includes(sender)
            let pushname = client.pushname = m.pushName
            const botNumber = jidNormalizedUser(client.user.id)
            let groupMetadata = isGroupMsg ? store?.groupMetadata[m.chat] !== undefined ? store.groupMetadata[m.chat] : await store.fetchGroupMetadata(m.chat, client) : {}
            let groupMembers = isGroupMsg ? groupMetadata.participants : []
            let groupAdmins = groupMembers.filter(v => v.admin !== null).map(x => x.id)
            let isGroupAdmin = isOwner || groupAdmins.includes(sender)
            let isBotGroupAdmin = groupAdmins.includes(botNumber)
            let formattedTitle = isGroupMsg ? groupMetadata.subject : ''
            let groupData = isGroupMsg ? groupManage.get(m.chat) : {}

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
            const args = body.trim().split(/ +/).slice(1);
            const flags = [];
            const isCmd = client.isCmd = body.startsWith(global.prefix);
            const cmd = client.cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null
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

            if (isGroupMsg) {
                groupManage.add(m.chat, formattedTitle)
            }

            if (isCmd && config.composing) {
                await client.presenceSubscribe(from)
                await client.sendPresenceUpdate('composing', from)
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
                    } else if (typeof plugin.groupMuteAllowed == 'undefined' && isGroupMsg && groupData.mute) {
                        m.reply(`bot tidak aktif di group ini, silahkan aktifkan ${prefix} on`)
                        continue
                    }
                    await plugin.exec(m, client, { body, prefix, args, arg, cmd, url, flags, msg, plugins })
                    statistics('cmd')
                    break
                } else if (plugin.regex instanceof RegExp && plugin.regex.test(body) && !m.isBot) {
                    if (typeof plugin.groupMuteAllowed == 'undefined' && isGroupMsg && groupData.mute) {
                        m.reply(`bot tidak aktif di group ini, silahkan aktifkan ${prefix} on`)
                        continue
                    } else {
                        logEvent(body.match(plugin.regex)[0])
                        await plugin.exec(m, client, { body, logEvent, prefix, args, cmd, url })
                        statistics('autodownload')
                    }
                } else if (plugin.startsWith && body.startsWith(plugin.startsWith) && !m.isBot) {
                    if (typeof plugin.owner != 'undefined' && plugin.owner && !isOwner) return
                    if (typeof plugin.admin != 'undefined' && plugin.admin && !isGroupAdmin) return
                    if (typeof plugin.botAdmin != 'undefined' && plugin.botAdmin && !isBotGroupAdmin) return
                    if (typeof plugin.group != 'undefined' && plugin.group && !isGroupMsg) return
                    if (typeof plugin.groupMuteAllowed == 'undefined' && isGroupMsg && groupData.mute) return
                    await plugin.exec(m, client, { body, prefix, args, arg, cmd, url, flags, msg, plugins })
                    statistics('cmd')
                } else if (plugin.groupEvent) {
                    if (typeof plugin.owner != 'undefined' && plugin.owner && !isOwner) return m.reply(cmdMSG.owner)
                    if (typeof plugin.admin != 'undefined' && plugin.admin && !isGroupAdmin) return m.reply(cmdMSG.notGroupAdmin)
                    if (typeof plugin.botAdmin != 'undefined' && plugin.botAdmin && !isBotGroupAdmin) return m.reply(cmdMSG.groupMsg)
                    if (typeof plugin.group != 'undefined' && plugin.group && !isGroupMsg) return m.reply(cmdMSG.groupMsg)
                    if (typeof plugin.groupMuteAllowed == 'undefined' && isGroupMsg && groupData.mute) return
                    await plugin.exec(m, client, { body, prefix, args, arg, cmd, url, flags, msg, plugins, formattedTitle })
                }
            }

        } catch (error) {
            console.log(color('[ERROR]', 'red'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), error);
        }
    })

    client.ws.on('CB:call', async call => {
        if (call.content[0].tag == 'offer') {
            const callerJid = call.content[0].attrs['call-creator']
            const { version, platform, notify, t } = call.attrs
            const caption = `Wahai _${notify || 'user botku'}_ , kamu telah menelpon bot pada *${moment(t * 1000).format('LLL')}* menggunakan device *${platform}* kamu, sehingga kamu diblokir oleh bot secara otomatis.\nsilahkan chat owner bot untuk membuka blok`
            await delay(3000)
            for (let i = 0; i < config.owner.length; i++) {
                await client.sendContact(callerJid, config.owner[i].split(S_WHATSAPP_NET)[0], `${config.owner.length < 1 ? 'Owner' : `Owner ${i + 1}`}`)
            }
            await delay(7000)
            await client.sendMessage(callerJid, { text: caption }).then(async () => {
                await client.updateBlockStatus(callerJid, 'block')
            })
        }
    })
};

start().catch(() => start());
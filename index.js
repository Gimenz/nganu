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
    generateThumbnail,
    getDevice,
    DisconnectReason,
    downloadContentFromMessage,
    delay,
    useSingleFileAuthState,
    generateWAMessage,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    Browsers,
    isJidGroup,
    S_WHATSAPP_NET,
    toBuffer,
    WAProto,
    extensionForMediaMessage,
    extractMessageContent,
    WAMetric,
    decryptMediaMessageBuffer,
    downloadHistory,
    makeInMemoryStore,
    unixTimestampSeconds,
    WAFlag,
    isJidUser,
    generateForwardMessageContent,
    jidNormalizedUser,
    jidDecode
} = require('@adiwajshing/baileys');
const _ = require('lodash')
const pino = require('pino');
const CFonts = require('cfonts');
const gradient = require('gradient-string');
let package = require('./package.json');
const yargs = require('yargs/yargs')
const { exec } = require('child_process');
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.config = require('./src/config.json')
global.quot = config.quot
global.API = config.api
global.owner = config.owner
global.footer = `${package.name} ~ Multi Device [BETA]`
let { igApi, shortcodeFormatter, isIgPostUrl } = require('insta-fetcher');
let ig = new igApi(process.env.session_id)
const { SID } = require('sid-api')
const sID = new SID(process.env.sid_email, process.env.sid_password);
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
    getBuffer,
    isUrl,
    humanFileSize,
    fetchAPI,
    shrt,
    secondsConvert,
    formatPhone,
    uploadImage,
    isTiktokVideo,
    formatK,
} = require('./utils');
const { Sticker, cropStyle } = require('./utils/sticker')
const { Serialize, generateUrlInfo, downloadMediaMessage } = require('./lib/simple');
const { download, parseMention } = require('./lib/function');
const { pasaran } = require('./lib/tgl');
const { Emoji } = require('./utils/exif');
const { toAudio, toGif, toMp4, EightD } = require('./lib/converter');
const YT = require('./lib/yt');
const cmdMSG = require('./src/cmdMessage.json')

/** DB */
if (!fs.existsSync('./db/chatsJid.json')) {
    fs.writeFileSync('./db/chatsJid.json', JSON.stringify([]), 'utf-8')
}
let chatsJid = JSON.parse(fs.readFileSync('./db/chatsJid.json', 'utf-8'))
const shortenerAuth = process.env.sid_email !== '' && process.env.sid_password !== ''

const start = async () => {
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
    let client = makeWASocket({
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.macOS('Safari')
        //browser: ['masgi', 'Safari', '3.0']
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
            const { statusCode } = lastDisconnect.error ? lastDisconnect.error?.output : 0;

            if (statusCode === DisconnectReason.badSession) { log(`Bad session file, delete ${session} and run again`); process.exit(); }
            else if (statusCode === DisconnectReason.connectionClosed) { log('Connection closed, reconnecting....'); start() }
            else if (statusCode === DisconnectReason.connectionLost) { log('Connection lost, reconnecting....'); start() }
            else if (statusCode === DisconnectReason.connectionReplaced) { log('Connection Replaced, Another New Session Opened, Please Close Current Session First'); process.exit() }
            else if (statusCode === DisconnectReason.loggedOut) { log(`Device Logged Out, Please Delete ${session} and Scan Again.`); process.exit(); }
            else if (statusCode === DisconnectReason.restartRequired) { log('Restart required, restarting...'); start(); }
            else if (statusCode === DisconnectReason.timedOut) { log('Connection timedOut, reconnecting...'); start(); }
            else { console.log(`Unknown DisconnectReason: ${lastDisconnect.error?.out}|${connection}`) }
        } else if (connection === 'open') {
            console.log(
                color('[SYS]', '#009FFF'),
                color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                color(`${package.name} is now Connected...`, '#38ef7d')
            );
        }
    });

    client.ev.on('creds.update', () => saveState)

    store.bind(client.ev)

    client.ev.on('messages.upsert', async (msg) => {
        try {
            if (!msg.messages) return
            const m = msg.messages[0]
            if (m.key.fromMe) return
            const from = m.key.remoteJid;
            let type = client.msgType = Object.keys(m.message)[0];
            //console.log(m.message.listResponseMessage.singleSelectReply.selectedRowId);
            Serialize(client, m)
            const content = JSON.stringify(JSON.parse(JSON.stringify(msg)).messages[0].message)
            let t = m.messageTimestamp
            client.time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
            const body = (type === 'conversation') ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.listResponseMessage.singleSelectReply.selectedRowId || m.message.buttonsResponseMessage.selectedButtonId || m.text) : ''

            let isGroupMsg = isJidGroup(from)
            const isMedia = (type === 'imageMessage' || type === 'videoMessage')
            const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
            const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
            const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
            const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
            let sender = m.sender
            const isOwner = config.owner.includes(sender)
            let pushname = m.pushName
            const botNumber = client.user.id
            const groupId = isGroupMsg ? from : ''
            let groupMetadata = isGroupMsg ? await client.groupMetadata(groupId) : {}
            let groupMembers = isGroupMsg ? groupMetadata.participants : []
            let groupAdmins = groupMembers.filter(v => v.admin !== null).map(x => x.id)
            let isGroupAdmin = groupAdmins.includes(sender)
            let isBotGroupAdmin = groupAdmins.includes(jidNormalizedUser(botNumber))

            let formattedTitle = isGroupMsg ? groupMetadata.subject : ''
            global.prefix = /^[./~!#%^&=\,;:()]/.test(body) ? body.match(/^[./~!#%^&=\,;:()]/gi) : '#'

            const arg = body.substring(body.indexOf(' ') + 1)
            let args = body.trim().split(/ +/).slice(1);
            let flags = [];
            let isCmd = client.isCmd = body.startsWith(global.prefix);
            let cmd = client.cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null
            let url = args.length !== 0 ? args[0] : '';

            for (let i of args) {
                if (i.startsWith('--')) flags.push(i.slice(2).toLowerCase())
            }

            const typing = async (jid) => await client.presenceSubscribe(jid) && await client.sendPresenceUpdate('composing', jid)
            const recording = async (jid) => await client.presenceSubscribe(jid) && await client.sendPresenceUpdate('recording', jid)
            const waiting = async (jid, m) => {
                await client.presenceSubscribe(jid)
                await client.sendPresenceUpdate('composing', jid)
                await client.sendMessage(jid, { text: 'proses...' }, { quoted: m })
            }
            const reply = async (text) => {
                await client.presenceSubscribe(from)
                await client.sendPresenceUpdate('composing', from)
                return client.sendMessage(from, { text }, { quoted: m })
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
                        fs.writeFileSync('./db/chatsJid.json', JSON.stringify(chatsJid), 'utf-8')
                    }
                }
                if (!chatsJid.some((x => x == sender))) {
                    chatsJid.push(sender)
                    fs.writeFileSync('./db/chatsJid.json', JSON.stringify(chatsJid), 'utf-8')
                }
            }

            if (isOwner) {
                if (body.startsWith("> ")) {
                    await typing(from)
                    let syntaxerror = require('syntax-error');
                    let _return;
                    let _syntax = '';
                    let _text = body.slice(2);
                    try {
                        let i = 15
                        let exec = new (async () => { }).constructor('print', 'msg', 'require', 'client', 'm', 'axios', 'fs', 'exec', _text);
                        _return = await exec.call(client, (...args) => {
                            if (--i < 1) return
                            console.log(...args)
                            return reply(from, util.format(...args))
                        }, msg, require, client, m, axios, fs, exec);
                    } catch (e) {
                        let err = await syntaxerror(_text, 'Execution Function', {
                            allowReturnOutsideFunction: true,
                            allowAwaitOutsideFunction: true
                        })
                        if (err) _syntax = '```' + err + '```\n\n'
                        _return = e
                    } finally {
                        reply(_syntax + util.format(_return))
                    }
                } else if (body.startsWith("$ ")) {
                    await typing(from)
                    exec(body.slice(2), (err, stdout) => {
                        if (err) return reply(`${err}`)
                        if (stdout) reply(`${stdout}`)
                    })
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

            if (isCmd) {
                await client.sendReadReceipt(from, sender, [m.key.id])
                await delay(2000)
                await client.presenceSubscribe(from)
                await client.sendPresenceUpdate('composing', from)
            }

            if (/https:\/\/.+\.tiktok.+/g.test(body) && !m.isBot) {
                try {
                    url = body.match(/https:\/\/.+\.tiktok.+/g)[0]
                    logEvent(url)
                    await typing(from)
                    await waiting(from, m)
                    const check = await isTiktokVideo(url)
                    if (!check.isVideo || check.isUser) {
                        const { result } = await fetchAPI('masgi', '/tiktok/user.php?u=' + check.pathname.split('@')[1])
                        const caption = `*TikTok Profile*\n\n` +
                            `➤ *Username :* @${result.user.uniqueId}\n` +
                            `➤ *Nickname :* ${result.user.nickname}\n` +
                            `➤ *Private :* ${result.user.privateAccount ? '✅' : '❌'}\n` +
                            `➤ *Followers :* ${formatK(result.stats.followerCount)}\n` +
                            `➤ *Following :* ${formatK(result.stats.followingCount)}\n` +
                            `➤ *Total Hearts :* ${formatK(result.stats.heartCount)}\n` +
                            `➤ *Total Videos :* ${formatK(result.stats.videoCount)}\n` +
                            `➤ *Created on :* ${moment(result.user.createTime * 1000).format('DD/MM/YY HH:mm:ss')}\n` +
                            `➤ *Bio :* ${result.user.signature}`
                        await client.sendFileFromUrl(from, result.user.avatarLarger, caption, m)
                    } else {
                        const data = await fetchAPI('masgi', '/tiktok/?url=' + url)
                        let { author, video, desc, music } = data.aweme_details[0]
                        let caption = `*Success* - ${'Video from https://www.tiktok.com/@' + author.unique_id || ''} [${desc}]`
                        let idMp3 = shrt(music.play_url.uri, { title: `${music.title}`, tiktokAudio: true })
                        let idVideo = shrt(video.play_addr.url_list[1], { title: `original sound - ${author.unique_id}` })
                        const btnCover = [
                            { quickReplyButton: { displayText: `Original Sound`, id: `${prefix}sendtaudio ${idMp3.id}` } },
                            { quickReplyButton: { displayText: `Extract Audio`, id: `${prefix}tomp3 ${idVideo.id}` } },
                            { urlButton: { displayText: `⏬ Download in Browser`, url: `${shortenerAuth ? 'https://s.id/' + (await sID.short(idVideo.url)).link.short : idVideo.url}` } }
                        ]
                        let buttonMessage = {
                            caption,
                            footer,
                            templateButtons: btnCover,
                            height: video.play_addr.height,
                            width: video.play_addr.width,
                            video: { url: video.play_addr.url_list[1] }
                        }
                        await client.sendMessage(from, buttonMessage, { quoted: m })
                    }
                } catch (error) {
                    console.log(error);
                    await reply('an error occurred')
                }
            }

            if (/https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+/g.test(m.text) && !m.isBot) {
                try {
                    url = body.match(/https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+/g)[0]
                    logEvent(url);
                    await typing(from)
                    let data = await fetchAPI('masgi', '/facebook/?url=' + url)
                    await waiting(from, m)
                    await client.sendFileFromUrl(from, data.videoUrl, `*Success* - ${data.title}`, m, '', 'mp4')
                } catch (error) {
                    console.log(error);
                    await reply('an error occurred')
                }
            }

            if (/https?:\/\/?(www|pin|id)?\.(it|pinterest\.co(m|\.[a-z]{1,2}))\S+\//g.test(body) && !m.isBot) {
                try {
                    await typing(from)
                    url = /https?:\/\/?(www|pin|id)?\.(it|pinterest\.co(m|\.[a-z]{1,2}))\S+\//g.exec(body)[0]
                    logEvent(url);
                    await waiting(from, m)
                    let data = await fetchAPI('masgi', '/pinterest/download.php?url=' + url)
                    let media = data.is_video ? data.videos.video_list[Object.getOwnPropertyNames(data.videos.video_list)[0]] : data.images.orig
                    await client.sendFileFromUrl(from, media.url, `*${data.title || data.closeup_unified_title}* - Posted at ${moment(data.created_at).format('DD/MM/YY HH:mm:ss')}`, m)
                } catch (error) {
                    console.log(error);
                    await reply('an error occurred')
                }
            }

            if (isIgPostUrl(body) && !m.isBot) {
                try {
                    let { url } = shortcodeFormatter(body);
                    await waiting(from, m)
                    let result = await ig.fetchPost(url);
                    let arr = result.links;
                    let capt = '✅ *Sukses Download Post Instagram*\n';
                    capt += '• Name : ' + result.name + '\n';
                    capt += '• Username : ' + result.username + '\n';
                    capt += '• Likes : ' + result.likes + '\n';
                    capt += '• Post Type : ' + result.postType + '\n';
                    capt += '• Media Count : ' + result.media_count;
                    reply(capt)
                    if (result.music !== null) {
                        const { original_sound_info, music_info } = result.music
                        music_meta = original_sound_info !== null ? original_sound_info : music_info
                        let idSound = shrt(
                            original_sound_info !== null ? music_meta.progressive_download_url : music_meta.music_asset_info.progressive_download_url,
                            { title: original_sound_info !== null ? `${music_meta.original_audio_title.join('')} - ${music_meta.ig_artist.full_name}` : `${music_meta.music_asset_info.title} - ${music_meta.music_asset_info.display_artist}` }
                        )
                        let idVideo = shrt(
                            result.links[0].url,
                            { title: `Audio asli - ${result.name}` }
                        )
                        const btnMusicMeta = [
                            { quickReplyButton: { displayText: `Original Sound`, id: `${prefix}sendthis ${idSound.id}` } },
                            { quickReplyButton: { displayText: `Extract Audio`, id: `${prefix}tomp3 ${idVideo.id}` } },
                        ]
                        client.sendMessage(
                            from,
                            {
                                footer,
                                templateButtons: btnMusicMeta,
                                video: { url: result.links[0].url },
                                headerType: 4
                            },
                            { quoted: m }
                        )
                    } else {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].type == "image") {
                                await client.sendFileFromUrl(from, arr[i].url, '', m, '', 'jpeg',
                                    { height: arr[i].dimensions.height, width: arr[i].dimensions.width }
                                )
                            } else {
                                await client.sendFileFromUrl(from, arr[i].url, '', m, '', 'mp4',
                                    { height: arr[i].dimensions.height, width: arr[i].dimensions.width }
                                )
                            }
                        }
                    }
                } catch (error) {
                    console.log(error);
                    reply('an error occurred')
                }
            }

            if (/https:\/\/(www\.)?instagram\.com\/stories\/.+/g.test(body) && !m.isBot) {
                try {
                    await typing(from)
                    await waiting(from, m)
                    let regex = new RegExp(/https:\/\/(www\.)?instagram\.com\/stories\/.+/g)
                    let u = body.match(regex)[0]
                    logEvent(u);
                    let s = u.indexOf('?') >= 0 ? u.split('?')[0] : (u.split('').pop() == '/' != true ? `${u}` : u);
                    let [username, storyId] = s.split('/stories/')[1].split('/')
                    const data = await ig.fetchStories(username);
                    let media = data.stories.filter(x => x.id.match(storyId))
                    if (media[0].type == "image") {
                        await client.sendFileFromUrl(
                            from, media[0].url, `_Stories from @${username}_\nTaken at : ${moment(media[0].taken_at * 1000).format('DD/MM/YY HH:mm:ss')}`, m, '', 'jpeg',
                            { height: media[0].original_height, width: media[0].original_width }
                        )
                    } else {
                        await client.sendFileFromUrl(
                            from, media[0].url, `_Stories from @${username}_\nTaken at : ${moment(media[0].taken_at * 1000).format('DD/MM/YY HH:mm:ss')}`, m, '', 'mp4',
                            { height: media[0].original_height, width: media[0].original_width }
                        )
                    }
                } catch (error) {
                    reply('an error occurred')
                    console.log(error);
                }
            }

            if (/https:\/\/www\.instagram\.com\/s\/.+story_media_id=([\w-]+)/g.test(body) && !m.isBot) {
                const link_highlight = /https:\/\/www\.instagram\.com\/s\/(.*?)\?story_media_id=([\w-]+)/g.exec(body)[0]
                try {
                    await typing(from)
                    logEvent(link_highlight);
                    const username = await axios.get(link_highlight).then(async res => {
                        const { data } = await axios.get(res.request.res.responseUrl + '?__a=1')
                        return data.user.username
                    })

                    let [, highlightId, mediaId] = /https:\/\/www\.instagram\.com\/s\/(.*?)\?story_media_id=([\w-]+)/g.exec(link_highlight)
                    highlightId = Buffer.from(highlightId, 'base64').toString('binary').match(/\d+/g)[0]
                    let { data } = await ig.fetchHighlights(username)
                    const filterHighlight = data.filter(x => highlightId.match(x.highlights_id))[0]
                    const filterReels = filterHighlight.highlights.filter(x => mediaId.match(x.media_id.match(/(\d+)/)[0]))[0]
                    let id = shrt(filterHighlight.cover, { title: filterHighlight.title, highlightCover: true })
                    const btnCover = [
                        { quickReplyButton: { displayText: `Highlight Cover`, id: `${prefix}sendthis ${id.id}` } },
                    ]
                    let buttonMessage = {
                        caption: `*${filterHighlight.title}* - _Highlights from https://www.instagram.com/${username}_\nTaken at : ${moment(filterReels.taken_at * 1000).format('DD/MM/YY HH:mm:ss')}`,
                        footer,
                        templateButtons: btnCover,
                        height: filterReels.dimensions.height,
                        width: filterReels.dimensions.width
                    }
                    filterReels.type == 'image'
                        ? buttonMessage['image'] = { url: filterReels.url }
                        : buttonMessage['video'] = { url: filterReels.url }
                    await client.sendMessage(from, buttonMessage, { quoted: m })
                } catch (error) {
                    console.log(error);
                    reply('an error occurred')
                }
            }

            if (/https?:\/\/twitter.com\/[0-9-a-zA-Z_]{1,20}\/status\/[0-9]*/g.test(body) && !m.isBot) {
                try {
                    let url = body.match(/https?:\/\/twitter.com\/[0-9-a-zA-Z_]{1,20}\/status\/[0-9]*/g)[0]
                    logEvent(url);
                    await typing(from)
                    let { result: data } = await fetchAPI('masgi', '/twitter/download.php?url=' + url)
                    await waiting(from, m)
                    await reply(`Media from *${data.name} [@${data.username}]* ${quot}${data.full_text}${quot}\n\nTotal ${data.media.mediaUrl.length} ${data.media.mediaType}` || '')
                    for (i of data.media.mediaUrl) {
                        if (data.media.mediaType == 'animated_gif') {
                            await client.sendFileFromUrl(from, i, '', m, '', '', { gif: true })
                        } else {
                            await client.sendFileFromUrl(from, i, '', m)
                        }
                    }
                } catch (error) {
                    console.log(error);
                    await reply('an error occurred')
                }
            }

            if (cmd == 'sendthis') {
                try {
                    let id = db.filter(x => x.id == args[0])[0]
                    if (id.tiktokAudio) {
                        await client.sendFileFromUrl(from, id.url, '', m, '', 'mp3', { fileName: id.title + '.mp3' })
                    } else if (id.highlightCover) {
                        await client.sendFileFromUrl(from, id.url, `Highlight Cover [${id.title}]`, m)
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (/tomp3|toaudio/i.test(cmd)) {
                try {
                    if (isQuotedVideo) {
                        const buffer = await client.downloadMediaMessage(m.quoted)
                        const res = await toAudio(buffer)
                        await client.sendFile(from, res, m, { audio: true })
                        // const message = await prepareWAMessageMedia({ audio: res, mimetype: 'audio/mp3' }, { upload: client.waUploadToServer, })
                        // let media = generateWAMessageFromContent(from, { audioMessage: message.audioMessage }, { quoted: m })
                        // await client.relayMessage(from, media.message, { messageId: media.key.id })
                    } else if (type == 'templateButtonReplyMessage') {
                        let id = db.filter(x => x.id == args[0])[0]
                        const res = await toAudio(id.url)
                        await client.sendFile(from, res, m, { document: true, mimetype: 'audio/mp3', fileName: id.title + '.mp3' })
                    } else {
                        reply(`reply a video with caption ${prefix}${cmd}`)
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (/8d(audio|)/i.test(cmd)) {
                let mediaType = m.quoted ? m.quoted.mtype : m.mtype
                let msg = m.quoted ? m.quoted : m
                if (/audio|video|document/i.test(mediaType)) {
                    await waiting(from, m)
                    const buffer = await client.downloadMediaMessage(msg)
                    const res = await EightD(buffer)
                    await recording(from)
                    await client.sendFile(from, res, m, { audio: true })
                } else {
                    reply(`reply a video/audio with caption ${prefix}${cmd}`)
                }
            }

            // CMD 
            if (cmd == 'asupan') {
                const tik = require('./lib/tiktok')
                try {
                    const data = await tik.getHashtagVideo(args.join(' '), 'shuffle')
                    if (data.length === 0) return reply('video not found')
                    const { video, author } = _.sample(data)
                    const tikUrl = `https://www.tiktok.com/@${author.uniqueId}/video/${video.id}`
                    await client.sendFileFromUrl(m.chat, video.playAddr, `Asupan dari => @${author.uniqueId}\n${(await tik.shorten(tikUrl)).shortlink}`, m)
                } catch (error) {
                    console.log(error);
                    m.reply('error occurred')
                }
            }

            if (cmd == 'short' || cmd == 'shorten' || cmd == 'pendekin') {
                if (!shortenerAuth) return reply('shortener auth didn\'t set yet')
                if (!isUrl(url)) return reply('bukan url')
                const { link } = await sID.short(url);
                reply(`shorted: https://s.id/${link.short}`)
            }

            if (cmd == 'bc' && isOwner) {
                try {
                    if (args.length < 1) return reply('text nya mana?')
                    reply(`sending broadcast message to *${chatsJid.length}* chats, estimated ${Math.floor((5 * chatsJid.length) / 60)} minutes done.`)
                    if (isMedia || /image|video/i.test(m.quoted ? m.quoted.mtype : m.mtype)) {
                        //const buff = await downloadMediaMessage(m.quoted ? m.quoted : m.message.imageMessage)
                        for (let v of chatsJid) {
                            await delay(5000)
                            let ms = m.quoted ? m.getQuotedObj() : m
                            await client.copyNForward(v, client.cMod(v, ms, `📢 *Mg Bot Broadcast*\n\n${args.join(' ')}\n\n#${chatsJid.indexOf(v) + 1}`, client.user.id), true)
                        }
                        reply(`Broadcasted to *${chatsJid.length}* chats`)
                    } else {
                        for (let v of chatsJid) {
                            await delay(5000)
                            await client.sendMessage(v, { text: `📢 *Mg Bot Broadcast*\n\n${args.join(' ')}\n\n#${chatsJid.indexOf(v) + 1}` }, { sendEphemeral: true })
                        }
                        reply(`Broadcasted to *${chatsJid.length}* chats`)
                    }
                } catch (error) {
                    reply(util.format(error))
                    console.log(error);
                }
            }

            if (cmd == 'music') {
                try {
                    if (args.length < 1) return reply(`*Fitur mencari lagu full tag metadata, sangat disarankan unutk memasukkan judul lagu yang tepat*\n${prefix}${cmd} judul - artis\n\ncontoh : ${prefix}${cmd} samudra janji - bima tarore`)
                    await typing(from)
                    const search = await YT.searchTrack(args.join(' '))
                    let caption = `✅ *Track ditemukan!*\n\n` +
                        `*Source :* ${search[0].isYtMusic ? 'YouTube Music' : 'YouTube'}\n` +
                        `*Title :* ${search[0].title}\n` +
                        `*Artist :* ${search[0].artist}\n` +
                        `*Durasi :* ${search[0].duration.label}`
                    await client.sendFileFromUrl(from, search[0].image, caption, m)
                    await recording(from)
                    const lagu = await YT.downloadMusic(search)
                    await client.sendFile(from, lagu.path, m, { fileName: lagu.meta.title + '.mp3', mimetype: 'audio/mp3', document: true, unlink: true })
                } catch (error) {
                    reply('aww snap. error happened')
                    console.log(error);
                }
            }

            if (cmd == 'play') {
                try {
                    if (args.length < 1) return reply(`*Fitur mencari lagu full tag metadata, sangat disarankan unutk memasukkan judul lagu yang tepat*\n${prefix}${cmd} judul - artis\n\ncontoh : ${prefix}${cmd} samudra janji - bima tarore`)
                    await typing(from)
                    const arr = await YT.searchTrack(args.join(' '))
                    let list = new Array();
                    let desc = `🎶 *Music Downloader*\nMusic Downloader dengan full tag metadata\n\nDitemukan *${arr.length}* lagu`
                    for (let i = 0; i < arr.length; i++) {
                        list.push({
                            title: `${i + 1}. ${arr[i].title}`,
                            description: `Artist : ${arr[i].artist}\nAlbum : ${arr[i].album}\nDuration : ${arr[i].duration.label}\nSource : ${arr[i].isYtMusic ? 'YouTube Music' : 'YouTube'}\nId : ${arr[i].id}`,
                            rowId: `${prefix}ytmp3 ${arr[i].url}`
                        });
                    }
                    await client.sendListM(
                        from,
                        { buttonText: 'Music Downloader', description: desc, title: 'Pilih untuk mendownload' },
                        list,
                        m
                    )
                } catch (error) {
                    reply('aww snap. error happened')
                    console.log(error);
                }
            }

            if (cmd == 'ytmp3') {
                try {
                    url = args[0]
                    if (args.length < 1 || !isUrl(url) || !YT.isYTUrl(url)) return reply(`*Penggunaan:*\n${prefix}${cmd} url --args\n*args* bersifat opsional (bisa diisi atau tidak)\n\n` +
                        `*list args:*\n--metadata : mendownload mp3 dengan tags metadata\n--vn dapat langsung di play via WA\n\ncontoh : ${prefix}ytmp3 https://youtu.be/0Mal8D63Zew --metadata`)
                    await typing(from)
                    if (type == 'listResponseMessage') {
                        const videoID = YT.getVideoID(url)
                        const search = await YT.searchTrack(videoID)
                        const metadata = search.filter(x => x.id == videoID)[0]
                        const dl = await YT.mp3(metadata.url, { Album: metadata.album, Artist: metadata.artist, Image: metadata.image, Title: metadata.title })
                        let caption = `✅ *Music Downloader*\n` +
                            `*Title :* ${metadata.title}\n` +
                            `*Artist :* ${metadata.artist}\n` +
                            `*Durasi :* ${metadata.duration.label}\n` +
                            `*Size :* ${humanFileSize(dl.size, true)}\n\nsedang mengirim file audio...`
                        await client.sendFileFromUrl(from, metadata.image, caption, m)
                        await recording(from)
                        await client.sendFile(from, dl.path, m, { fileName: `${metadata.title} - ${metadata.artist}.mp3`, mimetype: 'audio/mp3', jpegThumbnail: (await getBuffer(metadata.image)).buffer, document: true })
                    } else {
                        let dl = new Set()
                        if (flags.find(v => v.toLowerCase() === 'metadata')) {
                            await reply('Downloading mp3 [with tags metadata]')
                            const obj = await YT.mp3(url, '', true)
                            dl.add(obj)
                        } else {
                            const obj = await YT.mp3(url)
                            dl.add(obj)
                        }
                        dl = [...dl][0]
                        let caption = `✅ *YouTube Mp3 Downloader*\n\n` +
                            `*Title :* ${dl.meta.title}\n` +
                            `*Channel :* ${dl.meta.channel}\n` +
                            `*Durasi :* ${secondsConvert(dl.meta.seconds)}\n` +
                            `*Size :* ${humanFileSize(dl.size, true)}`
                        reply(caption)
                        await recording(from)
                        if (flags.find(v => v.toLowerCase() === 'vn')) {
                            await client.sendFile(from, dl.path, m, { audio: true, jpegThumbnail: (await getBuffer(dl.meta.image)).buffer, unlink: true })
                        } else {
                            await client.sendFile(from, dl.path, m, { fileName: `${dl.meta.title}.mp3`, mimetype: 'audio/mp3', document: true, jpegThumbnail: (await getBuffer(dl.meta.image)).buffer, unlink: true })
                        }
                    }
                } catch (error) {
                    reply('aww snap. error happened')
                    console.log(error);
                }
            }

            if (cmd == 'yt' || cmd == 'ytmp4') {
                if (args.length < 1 || !isUrl(url) || !YT.isYTUrl(url)) return reply('Bukan link YouTube')
                await typing(from)
                try {
                    const video = await YT.mp4(url)
                    let caption = `✅ *YouTube Downloader*\n\n` +
                        `*Title :* ${video.title}\n` +
                        `*Channel :* ${video.channel}\n` +
                        `*Published :* ${video.date}\n` +
                        `*Quality :* ${video.quality}\n` +
                        `*Durasi :* ${secondsConvert(video.duration)}`
                    reply(caption)
                    await client.sendFileFromUrl(from, video.videoUrl, '', m)
                } catch (error) {
                    reply('aww snap. error happened')
                    console.log(error);
                }
            }

            if (cmd == 'help' || cmd == 'menu') {
                await typing(from)
                const buttonsDefault = [
                    { urlButton: { displayText: `🌐 Rest api`, url: `https://masgimenz.my.id` } },
                    { urlButton: { displayText: `💌 Telegram Bot`, url: `https://t.me/tikdl_bot` } },
                    { quickReplyButton: { displayText: `☎ Owner`, id: `${prefix}owner` } },
                ]

                let text = `Hi *${pushname}* 🤗\nYour Device is : *${getDevice(m.key.id)}* \n\n*'${package.name}'* ~> coded by ${package.author}\n\n` +
                    `⌚️ : ${moment().format('HH:mm:ss')}\n` +
                    `📅 : ${pasaran().hijriyah}\n` +
                    `📆 : ${pasaran().jawa}\n\n` +
                    `${fs.readFileSync('./src/menu.txt', 'utf-8').replace(/prefix /g, prefix)}`
                client.sendMessage(from, { caption: text, footer, templateButtons: buttonsDefault, location: { jpegThumbnail: (await getBuffer('./src/logo.jpg')).buffer, name: `${package.name}` }, headerType: 4 }, { quoted: m })
            }

            if (/owner/.test(cmd)) {
                await typing(from)
                owner.map(async (v) => await client.sendContact(m.chat, v.split(S_WHATSAPP_NET)[0], package.author, m))
                await delay(2000)
                const btn = [
                    { urlButton: { displayText: `🌐 Web`, url: `https://masgimenz.my.id` } },
                    { urlButton: { displayText: `📸 Instagram`, url: `https://www.instagram.com/gimenz.id` } },
                    { urlButton: { displayText: `🐈 Github`, url: `https://github.com/Gimenz` } },
                    { urlButton: { displayText: `🎨 TikTok`, url: `https://www.tiktok.com/@gh0stp0w3r` } },
                ]
                client.sendMessage(from, { text: `Social Media`, footer, templateButtons: btn }, { quoted: m })
            }

            if (/^s(|ti(c|)ker)$/i.test(cmd)) {
                let crop = flags.find(v => cropStyle.map(x => x == v.toLowerCase()))
                let packname = /\|/i.test(body) ? arg.split('|')[0] : `${package.name}`
                let stickerAuthor = /\|/i.test(body) ? arg.split('|')[1] : `${package.author}`
                let categories = Object.keys(Emoji).includes(arg.split('|')[2]) ? arg.split('|')[2] : 'love' || 'love'
                try {
                    if (isMedia && !m.message.videoMessage || isQuotedImage) {
                        const message = isQuotedImage ? m.quoted : m
                        const buff = await client.downloadMediaMessage(message)
                        const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories }, crop)
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else if (m.message.videoMessage || isQuotedVideo) {
                        if (isQuotedVideo ? m.quoted.seconds > 15 : m.message.videoMessage.seconds > 15) return reply('too long duration, max 15 seconds')
                        const message = isQuotedVideo ? m.quoted : m
                        const buff = await client.downloadMediaMessage(message)
                        const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories })
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else if (isQuotedSticker && !m.quoted.isAnimated) {
                        const buff = await downloadMediaMessage(m.quoted)
                        const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories }, crop)
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else if (isUrl(url)) {
                        const data = new Sticker(url, { packname, author: stickerAuthor, packId: '', categories }, crop)
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else if (flags.find(v => v.match(/args|help/))) {
                        reply(`*list argumen :*\n\n${cropStyle.map(x => '--' + x).join('\n')}\n\nexample : ${prefix + cmd} --circle`)
                    } else {
                        reply(`send/reply media. media is video or image\n\nexample :\n${prefix}sticker https://s.id/REl2\n${prefix}sticker send/reply media\n\nor you can add --args\n*list argumen :*\n\n${cropStyle.map(x => '--' + x).join('\n')}\n\nexample : ${prefix + cmd} --circle`)
                    }
                } catch (error) {
                    reply('an error occurred');
                    console.log(error);
                }
            }

            if (/fl(i|o)p|rotate/.test(cmd)) {
                try {
                    const degrees = ['90', '180', '270', 'flip', 'flop']
                    const deg = /fl(i|o)p/i.test(cmd) ? cmd : Number(args[0])
                    let crop = flags.find(v => cropStyle.map(x => x == v.toLowerCase()))
                    if (isMedia || isQuotedImage) {
                        const message = isQuotedImage ? m.quoted : m
                        const buff = await client.downloadMediaMessage(message)
                        const data = await Sticker.rotate(buff, deg);
                        await client.sendMessage(from, { image: data, caption: args[0] }, { quoted: m })
                    } else if (isQuotedSticker) {
                        const buff = await client.downloadMediaMessage(m.quoted)
                        const rotated = await Sticker.rotate(buff, deg);
                        const data = new Sticker(rotated, { packname: package.name, author: package.author, packId: deg }, crop)
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else {
                        reply(`send/reply image or sticker. example :\n${prefix + cmd} degrees\n\nlist degrees :${degrees.map(x => '- ' + x).join('\n')}`)
                    }
                } catch (error) {
                    console.log(error);
                    reply('aww snap. error occurred')
                }
            }

            if (/^meme(sti(c|)ker)/.test(cmd)) {
                if (isMedia || isQuotedImage) {
                    try {
                        let [atas, bawah] = args.join(' ').replace('--nobg', '').replace('--removebg', '').split('|')
                        const mediaData = await downloadMediaMessage(m.quoted ? m.quoted : m)
                        let bgUrl;
                        if (flags.find(v => v.match(/nobg|removebg/))) {
                            const removed = await Sticker.removeBG(mediaData)
                            bgUrl = await uploadImage(removed)
                        } else {
                            bgUrl = await uploadImage(mediaData)
                        }
                        const res = await Sticker.memeGenerator(atas ? atas : '', bawah ? bawah : '', bgUrl)
                        const data = new Sticker(res, { packname: package.name, author: package.author })
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } catch (error) {
                        console.log(error);
                        reply('aww snap. error occurred')
                    }
                } else {
                    reply(`${isQuotedSticker ? 'you\'re replied a sticker message, please ' : ''}send/reply image. example :\n${prefix + cmd} aku diatas | kamu dibawah\n\nwith no background use --nobg`)
                }
            }

            if (cmd == 'emo' || cmd == 'semoji' || cmd == 'emoji') {
                try {
                    let vendor = ['apple', 'google', 'samsung', 'microsoft', 'whatsapp', 'twitter', 'facebook', 'skype', 'joypixels', 'openmoji', 'emojidex', 'messenger', 'lg', 'htc', 'mozilla']
                    const emojiRegex = require('emoji-regex')()
                    if ([...body.matchAll(emojiRegex)].length > 1) return reply('hanya bisa mengkonversi 1 emoji saja')
                    const res = await Sticker.emoji(args[0], flags[0])
                    if (res == undefined) return reply(`emoji tidak tersedia\n\nlist style:\n\n--${vendor.join('\n--')}`)
                    const data = new Sticker(res.url.replace('/thumbs/120/', '/thumbs/320/'), { packname: package.name, author: package.author })
                    await client.sendMessage(from, await data.toMessage(), { quoted: m })
                } catch (err) {
                    console.log(err);
                    reply('emoji not supported, try another one.\n\nDo Note! that not all emojis are supported')
                }
            }

            if (cmd == 'emojimix' || cmd == 'mix' || cmd == 'mixit') {
                try {
                    const kitchen = require('./lib/emojikitchen')
                    if (flags.find(v => v.match(/shuffle|random/))) {
                        const emoji = kitchen.shuffle()
                        const res = await kitchen.mix(emoji[0], emoji[1])
                        const data = new Sticker(_.sample(res.results).url, { packname: package.name, author: package.author })
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else {
                        const parsed = kitchen.parseEmoji(body)
                        if (parsed.length < 1) return reply('emoji not supported, try another one.\n\nDo Note! that not all emojis are supported yet')
                        const res = await kitchen.mix(parsed.length == 1 ? parsed[0] : parsed[0], parsed[1])
                        const img = _.sample(res.results).url
                        if (flags.find(v => v.match(/image|img|i/))) {
                            await client.sendFileFromUrl(from, img, `success ${shortenerAuth ? `https://s.id/${(await sID.short(img)).link.short}` : ''}`)
                        } else {
                            const data = new Sticker(img, { packname: package.name, author: package.author })
                            await client.sendMessage(from, await data.toMessage(), { quoted: m })
                        }
                    }
                } catch (err) {
                    console.log(err);
                    reply('emoji not supported, try another one.\n\nDo Note! that not all emojis are supported')
                }
            }

            if (cmd == 'removebg' || cmd == 'nobg' || cmd == 'rmbg') {
                try {
                    if (isMedia || isQuotedImage || m.quoted.mtype == 'documentMessage') {
                        //const mediaData = await downloadMediaMessage(m.quoted ? m.quoted : m)
                        const removed = await Sticker.removeBG(m.quoted ? await m.quoted.download() : await m.download());
                        if (flags.find(v => v.match(/((doc)|ument)|file/))) {
                            await client.sendMessage(from, { document: removed, fileName: sender.split('@')[0] + 'removed.png', mimetype: 'image/png', jpegThumbnail: removed }, { quoted: m })
                        } else {
                            await client.sendMessage(from, { image: removed, mimetype: 'image/png', caption: 'removed' }, { quoted: m })
                        }
                    } else if (isQuotedSticker) {
                        const removed = await Sticker.removeBG(await m.quoted.download())
                        const data = new Sticker(removed, { packname: package.name, author: package.author })
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else {
                        reply(`send/reply image. example :\n${prefix + cmd}\n\ndocument result use --doc`)
                    }
                } catch (error) {
                    console.log(error);
                    reply('aww snap. error occurred')
                }
            }

            if (/toimg/i.test(cmd)) {
                if (isQuotedSticker) {
                    try {
                        const media = await downloadMediaMessage(m.quoted)
                        await client.sendMessage(from, { image: media, jpegThumbnail: media }, { quoted: m })
                    } catch (error) {
                        console.log(error);
                        reply('an error occurred')
                    }
                } else {
                    await reply('reply a sticker')
                }
            }

            if (/extract/i.test(cmd)) {
                if (isQuotedSticker) {
                    try {
                        await client.presenceSubscribe(from)
                        await client.sendPresenceUpdate('composing', from)
                        const media = await downloadMediaMessage(m.quoted)
                        const json = await Sticker.extract(media);
                        reply(util.format(json))
                    } catch (error) {
                        console.log(error);
                        reply('an error occurred')
                    }
                } else {
                    await reply('reply a sticker')
                }
            }


            // Groups Moderation
            if (isCmd && isGroupMsg) {
                switch (cmd) {
                    case 'linkgroup':
                    case 'getlink':
                    case 'grouplink':
                    case 'linkgc': {
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        const inviteCode = await client.groupInviteCode(groupId)
                        const _text = `Buka tautan ini untuk bergabung ke Grup Whatsapp saya https://chat.whatsapp.com/${inviteCode}`
                        let thumb;
                        try { thumb = await client.profilePictureUrl(from, 'image') } catch (e) { thumb = './src/logo.jpg' }
                        const ms = await generateUrlInfo(from, _text, formattedTitle, 'Undangan Grup Whatsapp', thumb, m)
                        await client.relayMessage(from, ms.message, { messageId: ms.key.id })
                    }
                        break;
                    case 'all': case 'tagall':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        text = args.length >= 1 ? `${args.join(' ')}\n\n` : '*Tag All Members*\n\n'
                        n = 1
                        for (let i of groupMembers) {
                            text += `*_${n}_.* @${jidDecode(i.id).user}`
                            n++
                        }
                        client.sendMessage(m.chat, { text, mentions: groupMembers.map(x => x.id) })
                        break;
                    case 'h': case 'hidetag':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        client.sendMessage(m.chat, { text: args.join(' '), mentions: groupMembers.map(x => x.id) })
                        break;
                    case 'groupinfo':
                        const _meta = await client.groupMetadata(groupId)
                        let _img;
                        try { _img = await client.profilePictureUrl(_meta.id, 'image') } catch (e) { _img = './src/logo.jpg' }
                        let caption = `${_meta.subject} - Created by @${_meta.owner.split('@')[0]} on ${moment(_meta.creation * 1000).format('ll')}\n\n` +
                            `*${_meta.participants.length}* Total Members\n*${_meta.participants.filter(x => x.admin === 'admin').length}* Admin\n*${_meta.participants.filter(x => x.admin === null).length}* Not Admin\n\n` +
                            `Group ID : ${_meta.id}`
                        await client.sendMessage(from,
                            {
                                caption,
                                image: (await getBuffer(_img)).buffer,
                                jpegThumbnail: (await getBuffer('./src/logo.jpg')).buffer,
                                mentions: [_meta.owner]
                            },
                            { quoted: m }
                        )
                        break;
                    case '+':
                    case 'add':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        if (args.length < 1) return reply(`example: ${prefix + cmd} 628xxx, +6285-2335-xxxx, 085236xxx`)
                        try {
                            let _participants = args.join(' ').split`,`.map(v => formatPhone(v.replace(/[^0-9]/g, '')))
                            let users = (await Promise.all(
                                _participants.filter(async x => {
                                    (await client.onWhatsApp(x)).map(x => x.exists)
                                }))
                            )
                            await client.groupParticipantsUpdate(groupId, users, 'add').then(res => console.log(res)).catch(e => console.log(e))
                        } catch (error) {
                            reply(util.format(error))
                            console.log(error);
                        }
                        break;
                    case '-':
                    case 'kick':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        if (m.quoted) {
                            const _user = m.quoted.sender;
                            await client.groupParticipantsUpdate(groupId, [_user], 'remove')
                        } else if (args.length >= 1 || m.mentionedJid.length >= 1) {
                            let _participants = parseMention(args.join(' '))
                            if (_participants.length < 1) return reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
                            reply(`Kick/Remove *${_participants.length}* group members within delay 2 seconds to prevent banned`)
                            for (let usr of _participants) {
                                await delay(2000)
                                await client.groupParticipantsUpdate(groupId, [usr], 'remove')
                            }
                        } else {
                            reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
                        }
                        break;
                    case 'pm':
                    case 'upadmin':
                    case '^':
                    case 'promote':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        if (m.quoted) {
                            const _user = m.quoted.sender;
                            await client.groupParticipantsUpdate(groupId, [_user], 'promote')
                        } else if (args.length >= 1 || m.mentionedJid.length >= 1) {
                            let _participants = parseMention(body)
                            if (_participants.length < 1) return reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
                            reply(`Promoting *${_participants.length}* group members to be Group Admin within delay 3 seconds to prevent banned`)
                            for (let usr of _participants) {
                                await delay(3000)
                                await client.groupParticipantsUpdate(groupId, [usr], 'promote')
                            }
                        } else {
                            reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
                        }
                        break;
                    case 'dm':
                    case 'unadmin':
                    case 'demote':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        if (m.quoted) {
                            const _user = m.quoted.sender;
                            await client.groupParticipantsUpdate(groupId, [_user], 'demote')
                        } else if (args.length >= 1 || m.mentionedJid.length >= 1) {
                            let _participants = parseMention(body)
                            if (_participants.length < 1) return reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
                            reply(`Demoting *${_participants.length}* group members to be Group Mmbers within delay 3 seconds to prevent banned`)
                            for (let usr of _participants) {
                                await delay(3000)
                                await client.groupParticipantsUpdate(groupId, [usr], 'demote')
                            }
                        } else {
                            reply(`tag user atau reply pesan nya, contoh : ${prefix + cmd} @user`)
                        }
                        break;
                    case 'inv':
                    case 'rekrut':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        if (m.quoted) {
                            const _user = m.quoted.sender;
                            try {
                                await client.groupParticipantsUpdate(groupId, [_user], 'add')
                            } catch (error) {
                                const inviteCode = await client.groupInviteCode(groupId)
                                let thumb;
                                try { thumb = await client.profilePictureUrl(from, 'image') } catch (e) { thumb = './src/logo.jpg' }
                                await client.sendGroupV4Invite(groupId, _user, inviteCode, moment().add('3', 'days').unix(), false, thumb)
                                reply('inviting...')
                            }
                        } else {
                            reply(`reply pesan user yg mau di invite`)
                        }
                        break;
                    case 'setdesc':
                    case 'deskripsi':
                    case 'desc':
                    case 'updesc':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        if (args.length < 1) return reply(`Mengubah deskripsi group, example: ${prefix + cmd} ssstt... dilarang mengontol wkwkwk!`)
                        const _desc = args.join(' ')
                        await client.groupUpdateDescription(groupId, _desc)
                        break;
                    case 'uptitle':
                    case 'settitle':
                    case 'gname':
                    case 'upgname':
                    case 'cgname':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        if (args.length < 1) return reply(`Mengubah deskripsi group, example: ${prefix + cmd} ${package.name}`)
                        const _title = args.join(' ')
                        const _before = (await client.groupMetadata(groupId)).subject
                        await client.groupUpdateSubject(groupId, _title)
                        reply(`Berhasil mengubah nama group.\n\nBefore : ${_before}\nAfter : ${args.join(' ')}`)
                        break;
                    case 'lock':
                    case 'tutup':
                    case 'close':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        await client.groupSettingUpdate(groupId, 'announcement')
                        reply('success')
                        break;
                    case 'unlock':
                    case 'buka':
                    case 'open':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        await client.groupSettingUpdate(groupId, 'not_announcement')
                        reply('success')
                        break;
                    case 'setpicture':
                    case 'setimage':
                        if (!isGroupAdmin) return reply(cmdMSG.notGroupAdmin)
                        if (!isBotGroupAdmin) return reply(cmdMSG.botNotAdmin)
                        if (isMedia || isQuotedImage) {
                            const message = isQuotedImage ? m.quoted : m
                            const buffer = await downloadMediaMessage(message)
                            await client.updateProfilePicture(groupId, buffer)
                        } else if (isUrl(url)) {
                            await client.updateProfilePicture(groupId, { url })
                        } else {
                            reply(`send/reply image, or you can use url that containing image`)
                        }
                        break;
                }
            }

        } catch (error) {
            console.log(color('[ERROR]', 'red'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), error);
        }
    })
};

start();

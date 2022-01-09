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
    extensionForMediaMessage
} = require('@adiwajshing/baileys-md');
const pino = require('pino');
const CFonts = require('cfonts');
const gradient = require('gradient-string');
let package = require('./package.json');
let session = `./session.json`;
const { state, saveState } = useSingleFileAuthState(session);
global.config = require('./src/config.json')
global.quot = config.quot
global.API = config.api
global.owner = config.owner
global.footer = `${package.name} ~ Multi Device [BETA]`
let { igApi, shortcodeFormatter } = require('insta-fetcher');
let ig = new igApi(process.env.session_id)
const yargs = require('yargs/yargs')
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

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
} = require('./utils');
const { Sticker, cropType } = require('./utils/sticker')
const { Serialize } = require('./lib/simple');
const { download, parseMention } = require('./lib/function');
const { pasaran } = require('./lib/tgl');
const { Emoji } = require('./utils/exif');
const { toAudio } = require('./lib/converter');

/** DB */
if (!fs.existsSync('./db/chatsJid.json')) {
    fs.writeFileSync('./db/chatsJid.json', JSON.stringify([]), 'utf-8')
}
let chatsJid = JSON.parse(fs.readFileSync('./db/chatsJid.json', 'utf-8'))
const client = makeWASocket({
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: Browsers.macOS('Safari')
    //browser: ['masgi', 'Safari', '3.0']
});
global.client

if (opts['server']) require('./server').srv(client)

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


    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'connecting') {
            console.log(
                color('[SYS]', '#009FFF'),
                color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                color(`${package.name} is Authenticating...`, '#f12711')
            );
        } else if (connection === 'close') {
            console.log(color('[SYS]', '#009FFF'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(`Connection Closed, trying to reconnect`, '#f64f59'));
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                ? await start()
                : console.log(
                    color('[SYS]', '#009FFF'),
                    color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                    color(`WA Web Logged out`, '#f64f59')
                );;
        } else if (connection == 'open') {
            console.log(
                color('[SYS]', '#009FFF'),
                color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                color(`${package.name} is now Connected...`, '#38ef7d')
            );
        } else {
            await start()
        }
    });

    client.ev.on('creds.update', () => saveState)

    client.ev.on('messages.upsert', async (msg) => {
        try {
            if (!msg.messages) return
            const m = msg.messages[0]
            if (m.key.fromMe) return
            const from = m.key.remoteJid;
            let type = client.msgType = Object.keys(m.message)[0];
            Serialize(client, m)
            const content = JSON.stringify(JSON.parse(JSON.stringify(msg)).messages[0].message)
            let t = m.messageTimestamp
            client.time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
            let body = client.body = (type === 'conversation' && m.message.conversation) ? m.message.conversation : (type == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (type == 'documentMessage') && m.message.documentMessage.caption ? m.message.documentMessage.caption : (type == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (type == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : ""

            let isGroupMsg = isJidGroup(from)
            const isMedia = (type === 'imageMessage' || type === 'videoMessage')
            const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
            const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
            const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
            const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
            let sender = m.sender
            const isOwner = config.owner.includes(sender)
            let pushname = client.pushname = m.pushName
            const botNumber = client.user.id
            const groupId = isGroupMsg ? from : ''
            const groupMetadata = isGroupMsg ? await client.groupMetadata(groupId) : ''
            const groupMembers = isGroupMsg ? groupMetadata.participants : ''
            const groupAdmins = []
            for (let i of groupMembers) {
                i.isAdmin ? groupAdmins.push(i.jid) : ''
            }
            let formattedTitle = client.groupName = isGroupMsg ? groupMetadata.subject : ''
            global.prefix = client.prefix = /^[./~!#%^&+=\-,;:()]/.test(body) ? body.match(/^[./~!#%^&+=\-,;:()]/gi) : '#'

            const arg = body.substring(body.indexOf(' ') + 1)
            let args = client.args = body.trim().split(/ +/).slice(1);
            let isCmd = client.isCmd = body.startsWith(global.prefix);
            let cmd = client.cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null
            let url = args.length !== 0 ? args[0] : ''

            const typing = async (jid) => await client.sendPresenceUpdate('composing', jid)
            const recording = async (jid) => await client.sendPresenceUpdate('recording', jid)
            const waiting = async (jid, m) => await client.sendMessage(jid, { text: 'proses...' }, { quoted: m })
            global.reply = async (text) => {
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
                if (!chatsJid.some((x => x == from))) {
                    chatsJid.push(from)
                    fs.writeFileSync('./db/chatsJid.json', JSON.stringify(chatsJid), 'utf-8')
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

            await client.sendReadReceipt(from, sender, [m.key.id])

            if (/https:\/\/.+\.tiktok.+/g.test(body) && !m.isBot) {
                try {
                    url = body.match(/https:\/\/.+\.tiktok.+/g)[0]
                    logEvent(url)
                    await typing(from)
                    const data = await fetchAPI('masgi', '/tiktok/?url=' + url)
                    let { author, video, desc, music } = data.aweme_details[0]
                    await waiting(from, m)
                    let caption = `*Success* - ${'Video from https://www.tiktok.com/@' + author.unique_id || ''} [${desc}]`
                    let idMp3 = shrt(music.play_url.uri, { title: `${music.title}` })
                    let idVideo = shrt(video.play_addr.url_list[1], { title: `original sound - ${author.unique_id}` })
                    const btnCover = [
                        { quickReplyButton: { displayText: `Original Sound`, id: `${prefix}sendtaudio ${idMp3.id}` } },
                        { quickReplyButton: { displayText: `Extract Audio`, id: `${prefix}tomp3 ${idVideo.id}` } },
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
                    await sendFileFromUrl(from, data.videoUrl, `*Success* - ${data.title}`, m, '', 'mp4')
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
                    await sendFileFromUrl(from, media.url, `*${data.title || data.closeup_unified_title}* - Posted at ${moment(data.created_at).format('DD/MM/YY HH:mm:ss')}`, m)
                } catch (error) {
                    console.log(error);
                    await reply('an error occurred')
                }
            }

            if (/(?:https?:\/\/)?(?:www\.)?(?:instagram\.com(?:\/\w+)?\/(p|reel|tv)\/)([\w-]+)(?:\/)?(\?.*)?$/gim.test(body) && !m.isBot) {
                try {
                    let { type, shortcode } = shortcodeFormatter(body)
                    url = `https://www.instagram.com/${type}/${shortcode}`;
                    logEvent(url);
                    await waiting(from, m)
                    let result = await ig.fetchPost(url);
                    let arr = result.links;
                    let capt = '✅ *Sukses Download Post Instagram*\n';
                    capt += '• Name : ' + result.name + '\n';
                    capt += '• Username : ' + result.username + '\n';
                    capt += '• Likes : ' + result.likes + '\n';
                    capt += '• Media Count : ' + result.media_count;
                    reply(capt)
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].type == "image") {
                            await sendFileFromUrl(from, arr[i].url, '', m, '', 'jpeg',
                                { height: arr[i].dimensions.height, width: arr[i].dimensions.width }
                            )
                        } else {
                            await sendFileFromUrl(from, arr[i].url, '', m, '', 'mp4',
                                { height: arr[i].dimensions.height, width: arr[i].dimensions.width }
                            )
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
                        await sendFileFromUrl(
                            from, media[0].url, `_Stories from @${username}_\nTaken at : ${moment(media[0].taken_at * 1000).format('DD/MM/YY HH:mm:ss')}`, m, '', 'jpeg',
                            { height: media[0].original_height, width: media[0].original_width }
                        )
                    } else {
                        await sendFileFromUrl(
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
                    console.log(username);
                    let [, highlightId, mediaId] = /https:\/\/www\.instagram\.com\/s\/(.*?)\?story_media_id=([\w-]+)/g.exec(link_highlight)
                    highlightId = Buffer.from(highlightId, 'base64').toString('binary').match(/\d+/g)[0]
                    let { data } = await ig.fetchHighlights(username)
                    const filterHighlight = data.filter(x => highlightId.match(x.highlights_id))[0]
                    const filterReels = filterHighlight.highlights.filter(x => mediaId.match(x.media_id.match(/(\d+)/)[0]))[0]
                    let id = shrt(filterHighlight.cover, { title: filterHighlight.title })
                    const btnCover = [
                        { quickReplyButton: { displayText: `Highlight Cover`, id: `${prefix}sendhcover ${id.id}` } },
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
                            await sendFileFromUrl(from, i, '', m, '', '', { gif: true })
                        } else {
                            await sendFileFromUrl(from, i, '', m)
                        }
                    }
                } catch (error) {
                    console.log(error);
                    await reply('an error occurred')
                }
            }

            if (/sendhcover/i.test(cmd)) {
                try {
                    let id = db.filter(x => x.id == args[0])[0]
                    await sendFileFromUrl(from, id.url, `Highlight Cover [${id.title}]`, m)
                } catch (error) {
                    console.log(error);
                }
            }

            if (/sendtaudio/i.test(cmd)) {
                try {
                    let id = db.filter(x => x.id == args[0])[0]
                    await sendFileFromUrl(from, id.url, '', m, '', 'mp3', { fileName: id.title + '.mp3' })
                } catch (error) {
                    console.log(error);
                }
            }

            if (/tomp3|toaudio/i.test(cmd)) {
                try {
                    if (isQuotedVideo) {
                        const buffer = await client.downloadMediaMessage(m.quoted)
                        const res = await toAudio(buffer)
                        const message = await prepareWAMessageMedia({ audio: res, mimetype: 'audio/mp3' }, { upload: client.waUploadToServer, })
                        let media = generateWAMessageFromContent(from, { audioMessage: message.audioMessage }, { quoted: m })
                        await client.relayMessage(from, media.message, { messageId: media.key.id })
                    } else if (type == 'templateButtonReplyMessage') {
                        let id = db.filter(x => x.id == args[0])[0]
                        const res = await toAudio(id.url)
                        await client.sendMessage(from, { document: res, mimetype: 'audio/mp3', fileName: id.title + '.mp3' }, { quoted: m })
                    } else {
                        reply(`reply a video with caption ${prefix}${cmd}`)
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            // CMD 
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
                owner.map(async (v) => await sendContact(m.chat, v.split(S_WHATSAPP_NET)[0], package.author, m))
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
                const crop = Object.keys(cropType).includes(args[0]) ? args[0] : undefined
                let packname = /\|/i.test(body) ? arg.split('|')[0] : `${package.name}`
                let stickerAuthor = /\|/i.test(body) ? arg.split('|')[1] : `${package.author}`
                let categories = Object.keys(Emoji).includes(arg.split('|')[2]) ? arg.split('|')[2] : 'love' || 'love'
                try {
                    if (isMedia && !m.message.videoMessage || isQuotedImage) {
                        const message = isQuotedImage ? m.quoted : m.message.imageMessage
                        const buff = await client.downloadMediaMessage(message)
                        const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories }, crop)
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else if (m.message.videoMessage || isQuotedVideo) {
                        if (isQuotedVideo ? m.quoted.seconds > 15 : m.message.videoMessage.seconds > 15) return reply('too long duration, max 15 seconds')
                        const message = isQuotedVideo ? m.quoted : m.message.videoMessage
                        const buff = await client.downloadMediaMessage(message)
                        const data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories })
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else if (isUrl(url)) {
                        const data = new Sticker(url, { packname, author: stickerAuthor, packId: '', categories })
                        await client.sendMessage(from, await data.toMessage(), { quoted: m })
                    } else {
                        reply(`send/reply media. media is video or image\n\nexample :\n${prefix}sticker https://s.id/REl2\n${prefix}sticker send/reply media`)
                    }
                } catch (error) {
                    reply('an error occurred');
                    console.log(error);
                }
            }

            if (/toimg/i.test(cmd)) {
                if (isQuotedSticker) {
                    try {
                        await client.presenceSubscribe(from)
                        await client.sendPresenceUpdate('composing', from)
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

        } catch (error) {
            console.log(color('[ERROR]', 'red'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), error);
        }
    })

    /**
     * Send files from url with automatic file type specifier 
     * @param {string} jid this message sent to? 
     * @param {string} url url which contains media
     * @param {string} caption media message with caption, default is blank
     * @param {string} quoted the message you want to quote
     * @param {string} mentionedJid mentionedJid
     * @param {string} extension custom file extensions
     * @param  {...any} options 
     */
    async function sendFileFromUrl(jid, url, caption = '', quoted = '', mentionedJid, extension, options = {}, axiosOptions = {}) {
        let unlink;
        try {
            await client.presenceSubscribe(jid)
            const { filepath, mimetype } = await download(url, extension, axiosOptions);
            unlink = filepath
            mentionedJid = mentionedJid ? parseMention(mentionedJid) : []
            let mime = mimetype.split('/')[0]
            let thumb = await generateThumbnail(filepath, mime)
            if (mimetype == 'image/gif' || options.gif) {
                await client.sendPresenceUpdate('composing', jid)
                const message = await prepareWAMessageMedia({ video: { url: filepath }, caption, gifPlayback: true, gifAttribution: 1, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
                let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
                //await client.sendMessage(jid, { video: buffer, caption, gifPlayback: true, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { quoted })
            } else if (mime == 'video') {
                await client.sendPresenceUpdate('composing', jid)
                client.refreshMediaConn(false)
                const message = await prepareWAMessageMedia({ video: { url: filepath }, caption, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
                let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
            } else if (mime == 'image') {
                await client.sendPresenceUpdate('composing', jid)
                const message = await prepareWAMessageMedia({ image: { url: filepath }, caption, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
                let media = generateWAMessageFromContent(jid, { imageMessage: message.imageMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
            } else if (mime == 'audio') {
                await client.sendPresenceUpdate('recording', jid)
                const message = await prepareWAMessageMedia({ document: { url: filepath }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer })
                let media = generateWAMessageFromContent(jid, { documentMessage: message.documentMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
            } else {
                await client.sendPresenceUpdate('composing', jid)
                client.refreshMediaConn(false)
                const message = await prepareWAMessageMedia({ document: { url: filepath }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer, })
                let media = generateWAMessageFromContent(jid, { documentMessage: message.documentMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
            }
            fs.unlinkSync(filepath)
        } catch (error) {
            unlink ? fs.unlinkSync(unlink) : ''
            client.sendMessage(jid, { text: `error nganu => ${util.format(error)} ` }, { quoted })
        }

        // let content = mime == 'video' ? { video: data.buffer, caption: text, ...options } : mime == 'image' ? { image: data.buffer, caption: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options } : mime == 'audio' ? { audio: data.buffer, ptt: voice, ...options } : {}
        // client.sendMessage(jid, content, { quoted })    
        // await client.relayWAMessage(waMessage)
    }
    global.sendFileFromUrl;

    async function sendContact(jid, numbers, name, quoted, men) {
        let number = numbers.replace(/[^0-9]/g, '')
        const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n'
            + 'FN:' + name + '\n'
            + 'ORG:;\n'
            + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
            + 'END:VCARD'
        return client.sendMessage(jid, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions: men ? men : [] }, { quoted: quoted })
    }
    client.downloadMediaMessage = downloadMediaMessage
    /**
     * 
     * @param {any} message 
     * @returns 
     */
    async function downloadMediaMessage(message) {
        let mimes = (message.msg || message).mimetype || ''
        let messageType = mimes.split('/')[0].replace('application', 'document') ? mimes.split('/')[0].replace('application', 'document') : mimes.split('/')[0]
        let extension = mimes.split('/')[1]
        const stream = await downloadContentFromMessage(message, messageType)
        return await toBuffer(stream)
    }
};

start();

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
} = require('@adiwajshing/baileys-md');
const pino = require('pino');
const CFonts = require('cfonts');
const gradient = require('gradient-string');
let package = require('./package.json');
let session = `./session.json`;
const { state, saveState } = useSingleFileAuthState(session);
global.config = require('./src/config.json')
global.API = config.api
global.owner = config.owner
global.footer = `${package.name} ~ Multi Device [BETA]`
const { igApi } = require('insta-fetcher');
const ig = new igApi(config.session_id)

/** LOCAL MODULE */
const {
    color,
    bgColor,
    msgs,
    getBuffer,
    isUrl,
    humanFileSize,
    formatIGUrl,
    fetchAPI,
} = require('./utils/function');
const { Serialize } = require('./lib/simple');
const { tiktokDL } = require('./lib/tiktok');
const { download, parseMention } = require('./lib/function');

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
    console.log(
        color('[SYS]', '#009FFF'),
        color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
        color(`${package.name} is Authenticating...`, '#f64f59')
    );

    const client = makeWASocket({
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['nganu', 'Safari', '3.0'],
    });

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log('connection closed, try to restart');
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                ? start()
                : console.log('WA Web Logged Out...');
        }
    });

    console.log(
        color('[SYS]', '#009FFF'),
        color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
        color(`${package.name} is now Connected...`, '#38ef7d')
    );
    client.type

    client.ev.on('creds.update', () => saveState)
    client.ev.on('messages.upsert', async (msg) => {
        try {
            if (!msg.messages) return
            const m = msg.messages[0]
            if (m.key.fromMe) return
            const from = m.key.remoteJid;
            let type = Object.keys(m.message)[0];
            Serialize(client, m)
            const content = JSON.stringify(JSON.parse(JSON.stringify(msg)).messages[0].message)
            let t = m.messageTimestamp
            const body = (type === 'conversation' && m.message.conversation) ? m.message.conversation : (type == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (type == 'documentMessage') && m.message.documentMessage.caption ? m.message.documentMessage.caption : (type == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (type == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : ""

            const isGroupMsg = m.key.remoteJid.endsWith('@g.us')
            const isMedia = (type === 'imageMessage' || type === 'videoMessage')
            const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
            const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
            const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
            const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
            const sender = m.sender
            const isOwner = config.owner.includes(sender)
            let pushname = m.pushName
            const botNumber = client.user.id
            const groupId = isGroupMsg ? from : ''
            const groupMetadata = isGroupMsg ? await client.groupMetadata(groupId) : ''
            const groupMembers = isGroupMsg ? groupMetadata.participants : ''
            const groupAdmins = []
            for (let i of groupMembers) {
                i.isAdmin ? groupAdmins.push(i.jid) : ''
            }
            const formattedTitle = isGroupMsg ? groupMetadata.subject : ''
            global.prefix = /^[./~!#%^&+=\-,;:()]/.test(body) ? body.match(/^[./~!#%^&+=\-,;:()]/gi) : '#'

            const arg = body.substring(body.indexOf(' ') + 1)
            const args = body.trim().split(/ +/).slice(1);
            const isCmd = body.startsWith(global.prefix);
            const cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null
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

            if (config.autoReads) await client.sendReadReceipt(from, sender, [m.key.id])

            if (cmd == 'help' || cmd == 'menu') {
                await typing(from)
                const buttonsDefault = [
                    { urlButton: { displayText: `🌐 Rest api`, url: `https://masgimenz.my.id` } },
                    { urlButton: { displayText: `💌 Telegram Bot`, url: `https://t.me/tikdl_bot` } },
                    { quickReplyButton: { displayText: `☎ Owner`, id: `${prefix}owner` } },
                ]

                let text = `Hi *${pushname}* 🤗\n\n*'${package.name}'* ~> coded by ${package.author}\n\n` +
                    `⌚️ : ${moment().format('HH:mm:ss')}\n\n` +
                    `${fs.readFileSync('./src/menu.txt', 'utf-8').replace(/prefix /, prefix)}`
                client.sendMessage(from, { text, footer, templateButtons: buttonsDefault, headerType: 3 }, { quoted: m })
            }

            if (/owner/.test(cmd)) {
                await typing(from)
                owner.map(async (v) => await sendContact(m.chat, v.split('@s.whatsapp.net')[0], package.author, m))
                await delay(2000)
                const buttonsDefault = [
                    { urlButton: { displayText: `🌐 Web`, url: `https://masgimenz.my.id` } },
                    { urlButton: { displayText: `📸 Instagram`, url: `https://www.instagram.com/gimenz.id` } },
                    { urlButton: { displayText: `🐈 Github`, url: `https://github.com/Gimenz` } },
                    { urlButton: { displayText: `🎨 TikTok`, url: `https://www.tiktok.com/@gh0stp0w3r` } },
                ]
                client.sendMessage(from, { text: `Social Media`, footer, templateButtons: buttonsDefault }, { quoted: m })
            }

            if (/https:\/\/.+\.tiktok.+/g.test(body)) {
                try {
                    url = body.match(/https:\/\/.+\.tiktok.+/g)[0]
                    logEvent(url)
                    await typing(from)
                    const data = await tiktokDL(url)
                    let author = `Video from https://www.tiktok.com/@${data.authorMeta.username}` || ''
                    await waiting(from, m)
                    let caption = `*Success* - ${author} [${data.desc}]`
                    await sendFileFromUrl(from, data.videoUrlNoWatermark.url_list[1], caption, m, '', 'mp4', { height: data.videoUrlNoWatermark.height, width: data.videoUrlNoWatermark.width })
                } catch (error) {
                    console.log(error);
                    await reply('an error occurred')
                }
            }

            if (/https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+/g.test(m.text)) {
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

            if (/https?:\/\/?(www|pin|id)?\.(it|pinterest\.co(m|\.[a-z]{1,2}))\S+\//g.test(body)) {
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

            if (/(?:https?:\/\/)?(?:www\.)?(?:instagram\.com(?:\/\w+)?\/(p|reel|tv)\/)([\w-]+)(?:\/)?(\?.*)?$/gim.test(body)) {
                try {
                    url = formatIGUrl(body);
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

            if (/https:\/\/(www\.)?instagram\.com\/stories\/.+/g.test(body)) {
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

            if (/https:\/\/www\.instagram\.com\/s\/.+story_media_id=([\w-]+)/g.test(body)) {
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
                    await sendFileFromUrl(from, filterReels.url, `*${filterHighlight.title}* - _Highlights from https://www.instagram.com/${username}_\nTaken at : ${moment(filterReels.taken_at * 1000).format('DD/MM/YY HH:mm:ss')}`, m, '')
                } catch (error) {
                    console.log(error);
                    reply('an error occurred')
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
     * @param {boolean} asDocument if set to true, it will send media (audio) as document
     * @param  {...any} options 
     */
    async function sendFileFromUrl(jid, url, caption = '', quoted = '', mentionedJid, extension, options = {}, axiosOptions = {}) {
        try {
            const { filepath, mimetype } = await download(url, extension, axiosOptions);
            mentionedJid = mentionedJid ? parseMention(mentionedJid) : []
            let mime = mimetype.split('/')[0]
            if (mime == 'gif') {
                await client.sendPresenceUpdate('composing', jid)
                let thumb = await generateThumbnail(filepath, mime)
                const message = await prepareWAMessageMedia({ video: { url: filepath }, caption, gifPlayback: true, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
                let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
                //await client.sendMessage(jid, { video: buffer, caption, gifPlayback: true, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { quoted })
                fs.unlinkSync(filepath)
            } else if (mime == 'video') {
                await client.sendPresenceUpdate('composing', jid)
                let thumb = await generateThumbnail(filepath, mime)
                client.refreshMediaConn(false)
                const message = await prepareWAMessageMedia({ video: { url: filepath }, caption, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
                let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
                fs.unlinkSync(filepath)
            } else if (mime == 'image') {
                await client.sendPresenceUpdate('composing', jid)
                let thumb = await generateThumbnail(filepath, mime)
                const message = await prepareWAMessageMedia({ image: { url: filepath }, caption, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
                let media = generateWAMessageFromContent(jid, { imageMessage: message.imageMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
                fs.unlinkSync(filepath)
            } else if (mime == 'audio') {
                await recording(jid)
                const message = await prepareWAMessageMedia({ document: { url: filepath }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer })
                let media = generateWAMessageFromContent(jid, { documentMessage: message.documentMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
                fs.unlinkSync(filepath)
            } else {
                await client.sendPresenceUpdate('composing', jid)
                client.refreshMediaConn(false)
                const message = await prepareWAMessageMedia({ document: { url: filepath }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer, })
                let media = generateWAMessageFromContent(jid, { documentMessage: message.documentMessage }, { quoted })
                await client.relayMessage(jid, media.message, { messageId: media.key.id })
                fs.unlinkSync(filepath)
            }
        } catch (error) {
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
    async function downloadMediaMessage(message) {
        let mimes = (message.msg || message).mimetype || ''
        let messageType = mimes.split('/')[0].replace('application', 'document') ? mimes.split('/')[0].replace('application', 'document') : mimes.split('/')[0]
        let extension = mimes.split('/')[1]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }
};

start();

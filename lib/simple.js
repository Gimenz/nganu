global.fs = require('fs');
global.util = require('util');

const {
    proto,
    downloadContentFromMessage,
    generateWAMessageFromContent,
    URL_REGEX,
    WAProto,
    generateWAMessageContent,
    generateWAMessage,
    extensionForMediaMessage,
    AnyWASocket,
    toBuffer,
    getContentType,
    generateForwardMessageContent,
    getDevice,
    generateThumbnail,
    prepareWAMessageMedia,
    areJidsSameUser,
    jidNormalizedUser,
    getBinaryNodeMessages,
    WAMetric,
    WAFlag,
    isJidGroup,
    isJidBroadcast,
} = require('@adiwajshing/baileys');
const { getBuffer } = require('../utils');
const { download, parseMention } = require('./function');
const fs = require('fs');
const { statistics } = require('../db');
let config = JSON.parse(fs.readFileSync('./src/config.json', 'utf-8'))

const generateUrlInfo = async (jid, text, title = 'enak mas', description = 'nganu mas', jpegThumbnail = './src/logo.jpg', quoted = {}) => {
    const ms = generateWAMessageFromContent(jid, {
        extendedTextMessage: {
            text,
            canonicalUrl: '',
            description,
            title,
            matchedText: 'https://' + text.match(URL_REGEX)[0],
            jpegThumbnail: (await getBuffer(jpegThumbnail)).buffer
        }
    }, { timestamp: new Date(), quoted })
    return ms
}

const setStatus = (status) => {
    client.query({
        tag: 'iq',
        attrs: {
            to: '@s.whatsapp.net',
            type: 'set',
            xmlns: 'status',
        },
        content: [{
            tag: 'status',
            attrs: {},
            content: Buffer.from(status, 'utf-8')
        }]
    })
    return status
}

/**
 * 
 * @param {proto.IMessage} message 
 * @returns 
 */
const downloadMediaMessage = async (message) => {
    m = message.quoted !== null ? message : message.msg
    const mediaType = {
        imageMessage: "image",
        videoMessage: "video",
        stickerMessage: "sticker",
        documentMessage: "document",
        audioMessage: "audio",
    };

    const stream = await downloadContentFromMessage(m, mediaType[message.mtype])
    return await toBuffer(stream)
}

/**
 * 
 * @param {string} jid 
 * @param {proto.WebMessageInfo} copy 
 * @param {string} text 
 * @param {string} sender 
 * @param {*} options 
 * @returns 
 */
function cMod(jid, copy, text = '', sender = client.user.id, options = {}) {
    //let copy = message.toJSON()
    let mtype = getContentType(copy.message)
    let isEphemeral = mtype === 'ephemeralMessage'
    if (isEphemeral) {
        mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
    }
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
    let content = msg[mtype]
    if (typeof content === 'string') msg[mtype] = text || content
    else if (text || content.caption) content.caption = text || content.caption
    else if (content.text) content.text = text || content.text
    if (typeof content !== 'string') msg[mtype] = {
        ...content,
        ...options
    }
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
    else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
    if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
    else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
    copy.key.remoteJid = jid
    copy.key.fromMe = areJidsSameUser(sender, client.user.id)
    if (options.mentions) {
        copy.message[mtype].contextInfo.mentionedJid = options.mentions
    }

    return proto.WebMessageInfo.fromObject(copy)
}

/**
 * 
 * @param {string} jid 
 * @param {proto.WebMessageInfo} message 
 * @param {boolean} forceForward 
 * @param {any} options 
 * @returns 
 */
async function copyNForward(jid, message, forceForward = false, options = {}) {
    let vtype
    let mtype = getContentType(message.message)
    if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
        vtype = Object.keys(message.message.viewOnceMessage.message)[0]
        delete (message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = {
            ...message.message.viewOnceMessage.message
        }
    }

    if (options.mentions) {
        message.message[mtype].contextInfo.mentionedJid = options.mentions
    }

    let content = generateForwardMessageContent(message, forceForward)
    let ctype = getContentType(content)
    let context = {}
    if (mtype != "conversation") context = message.message[mtype].contextInfo
    content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo,
    }
    const waMessage = generateWAMessageFromContent(jid, content, options ? {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
            contextInfo: {
                ...content[ctype].contextInfo,
                ...options.contextInfo
            }
        } : {})
    } : {})
    await client.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
    return waMessage
}

async function sendFile(jid, path, quoted, options = {}) {
    let mimetype = 'audio/mpeg'//getDevice(quoted.id) == 'ios' ? 'audio/mpeg' : 'audio/mp4'
    let opt = { fileName: options.fileName || '', ...options }
    if (options.audio) opt['audio'] = Buffer.isBuffer(path) ? { buffer: path, mimetype, mp3: true } : { url: path, mimetype, mp3: true }
    if (options.document) opt['document'] = Buffer.isBuffer(path) ? { buffer: path, mimetype: options.mimetype } : { url: path, mimetype: options.mimetype }
    if (options.image) opt['image'] = Buffer.isBuffer(path) ? { buffer: path, mimetype: options.mimetype } : { url: path, mimetype: options.mimetype }
    await client.sendMessage(jid, opt, { quoted })
        .then(() => {
            try {
                let { size } = fs.statSync(path)
                statistics('filesize', size)
                if (options.unlink) {
                    console.log('unlink');
                    fs.unlinkSync(path)
                }
            } catch (error) {
                console.log(error);
            }
        })
}

/**
 * send group invitation via message
 * @param {string} jid gorupJid 
 * @param {string} participant this message sent to?
 * @param {string} inviteCode group invite code
 * @param {Number} inviteExpiration invite expiration
 * @param {string} groupName group name
 * @param {string} jpegThumbnail file path or url
 * @param {string} caption message caption
 * @param {any} options message options
 */
async function sendGroupV4Invite(jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', jpegThumbnail, caption = 'Invitation to join my WhatsApp group', options = {}) {
    let msg = WAProto.Message.fromObject({
        groupInviteMessage: WAProto.GroupInviteMessage.fromObject({
            inviteCode,
            inviteExpiration: inviteExpiration ? parseInt(inviteExpiration) : + new Date(new Date + (3 * 86400000)),
            groupJid: jid,
            groupName: groupName ? groupName : (await client.groupMetadata(jid)).subject,
            jpegThumbnail: jpegThumbnail ? (await getBuffer(jpegThumbnail)).buffer : '',
            caption
        })
    })
    const m = generateWAMessageFromContent(participant, msg, options)
    await client.relayMessage(participant, m.message, { messageId: m.key.id })
}

/**
 * send ListMessage with custom array
 * @param {string} jid this message send to?
 * @param {Object} button { buttonText, description, title }
 * @param {Array|Object} rows list of edited rows
 * @param {Object} quoted quoted m
 * @param {Object} options 
 * @returns 
 */
async function sendListM(jid, button, rows, quoted, options = {}) {
    if (config.composing) {
        await client.sendPresenceUpdate('composing', jid)
    }
    let messageList = WAProto.Message.fromObject({
        listMessage: WAProto.ListMessage.fromObject({
            buttonText: button.buttonText,
            description: button.description,
            listType: 1,
            sections: [
                {
                    title: button.title,
                    rows: [...rows]
                }
            ],
            ...options
        })
    })
    let waMessageList = generateWAMessageFromContent(jid, messageList, { quoted, userJid: jid, contextInfo: { ...options } })
    return await client.relayMessage(jid, waMessageList.message, { messageId: waMessageList.key.id })
}

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

/**
 * Send files from url with automatic file type specifier 
 * @param {string} jid this message sent to? 
 * @param {string} url url which contains media
 * @param {string} caption media message with caption, default is blank
 * @param {string} quoted the message you want to quote
 * @param {string} mentionedJid mentionedJid
 * @param {string} extension custom file extensions
 * @param {any} options 
 */
async function sendFileFromUrl(jid, url, caption = '', quoted = '', mentionedJid, extension, options = {}, axiosOptions = {}) {
    let unlink;
    try {
        await client.presenceSubscribe(jid)
        if (config.composing) {
            await client.sendPresenceUpdate('composing', jid)
        }
        const { filepath, mimetype } = await download(url, extension, axiosOptions);
        let { size } = fs.statSync(filepath)
        statistics('filesize', size)
        unlink = filepath
        mentionedJid = mentionedJid ? parseMention(mentionedJid) : []
        let mime = mimetype.split('/')[0]
        let thumb = await generateThumbnail(filepath, mime)
        if (mimetype == 'image/gif' || options.gif) {
            const message = await prepareWAMessageMedia({ video: { url: filepath }, caption, gifPlayback: true, gifAttribution: 1, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
            let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted, mediaUploadTimeoutMs: 600000 })
            await client.relayMessage(jid, media.message, { messageId: media.key.id })
            //await client.sendMessage(jid, { video: buffer, caption, gifPlayback: true, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { quoted })
        } else if (mime == 'video') {
            const message = await prepareWAMessageMedia({ video: { url: filepath }, caption, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
            let media = generateWAMessageFromContent(jid, { videoMessage: message.videoMessage }, { quoted, mediaUploadTimeoutMs: 600000 })
            await client.relayMessage(jid, media.message, { messageId: media.key.id })
        } else if (mime == 'image') {
            const message = await prepareWAMessageMedia({ image: { url: filepath }, caption, mentions: mentionedJid, jpegThumbnail: thumb, ...options }, { upload: client.waUploadToServer })
            let media = generateWAMessageFromContent(jid, { imageMessage: message.imageMessage }, { quoted, mediaUploadTimeoutMs: 600000 })
            await client.relayMessage(jid, media.message, { messageId: media.key.id })
        } else if (mime == 'audio') {
            await client.sendPresenceUpdate('recording', jid)
            const message = await prepareWAMessageMedia({ document: { url: filepath }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer })
            let media = generateWAMessageFromContent(jid, { documentMessage: message.documentMessage }, { quoted, mediaUploadTimeoutMs: 600000 })
            await client.relayMessage(jid, media.message, { messageId: media.key.id })
        } else {
            const message = await prepareWAMessageMedia({ document: { url: filepath }, mimetype: mimetype, fileName: options.fileName }, { upload: client.waUploadToServer, })
            let media = generateWAMessageFromContent(jid, { documentMessage: message.documentMessage }, { quoted, mediaUploadTimeoutMs: 600000 })
            await client.relayMessage(jid, media.message, { messageId: media.key.id })
        }
        fs.unlinkSync(filepath)
    } catch (error) {
        unlink ? fs.unlinkSync(unlink) : ''
        client.sendMessage(jid, { text: `error nganu => ${util.format(error)} ` }, { quoted })
    }
}

/**
 * 
 * @param {AnyWASocket} sock 
 * @param {proto.IWebMessageInfo} m 
 * @returns 
 */
exports.Serialize = (sock, m) => {
    sock.generateUrlInfo = generateUrlInfo
    sock.setStatus = setStatus
    sock.downloadMediaMessage = downloadMediaMessage
    sock.cMod = cMod
    sock.copyNForward = copyNForward
    sock.sendFile = sendFile
    sock.sendGroupV4Invite = sendGroupV4Invite
    sock.sendListM = sendListM
    sock.sendContact = sendContact
    sock.sendFileFromUrl = sendFileFromUrl
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBot = (m.id.startsWith('BAE5') && m.id.length === 16);
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.fromMe
            ? jidNormalizedUser(sock.user.id) || ''
            : (
                isJidGroup(m.key.remoteJid)
                    ? jidNormalizedUser(m.key.participant)
                    : isJidBroadcast(m.key.remoteJid)
                        ? jidNormalizedUser(m.key.participant)
                        : jidNormalizedUser(m.key.remoteJid)
            );
        m.device = getDevice(m.id)
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        //m.body = m.message.conversation || m.message[m.mtype].caption || m.message[m.mtype].text || (m.mtype == 'listResponseMessage') && m.message[m.mtype].singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.message[m.mtype].selectedButtonId || m.mtype
        m.msg = m.message[m.mtype];
        if (m.mtype === 'ephemeralMessage') {
            this.Serialize(sock, m.msg);
            m.mtype = m.msg.mtype;
            m.msg = m.msg.msg;
        }
        let quoted = (m.quoted = m.msg.contextInfo
            ? m.msg.contextInfo.quotedMessage
            : null);
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
        if (m.quoted) {
            let type = getContentType(m.quoted);
            m.quoted = m.quoted[type];
            if (['productMessage'].includes(type)) {
                type = Object.keys(m.quoted)[0];
                m.quoted = m.quoted[type];
            }
            if (typeof m.quoted === 'string')
                m.quoted = {
                    text: m.quoted,
                };
            m.quoted.mtype = type;
            m.quoted.id = m.msg.contextInfo.stanzaId;
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
            m.quoted.isBot = m.quoted.id
                ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false;
            m.quoted.sender =
                m.msg.contextInfo.participant.split(':')[0] ||
                m.msg.contextInfo.participant;
            m.quoted.fromMe = areJidsSameUser(m.quoted.sender, (sock.user && sock.user.id));
            m.quoted.text = m.quoted.text || m.quoted.caption || '';
            m.quoted.device = getDevice(m.quoted.id)
            m.quoted.mentionedJid = m.msg.contextInfo
                ? m.msg.contextInfo.mentionedJid
                : [];
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })
            m.quotedMsg = m.getQuotedObj = () => vM

            /**
             * 
             * @returns 
             */
            m.quoted.delete = () => sock.sendMessage(m.quoted.chat, { delete: vM.key })

            /**
             * 
             * @param {*} jid 
             * @param {*} forceForward 
             * @param {*} options 
             * @returns 
            */
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => sock.copyNForward(jid, vM, forceForward, options)

            /**
              *
              * @returns
            */
            m.quoted.download = () => sock.downloadMediaMessage(m.quoted)
            /**
             * Modify quoted Message
             * @param {String} jid
             * @param {String} text
             * @param {String} sender
             * @param {Object} options
             */
            m.quoted.cMod = (jid, text = '', sender = m.quoted.sender, options = {}) => conn.cMod(jid, vM, text, sender, options)
        }
    }
    if (m.msg.url) m.download = () => sock.downloadMediaMessage(m.msg)
    m.text = (m.mtype == 'listResponseMessage' ? m.msg.singleSelectReply.selectedRowId : '') || m.msg.text || m.msg.caption || m.msg || ''
    /**
    * Reply to this message
    * @param {String|Object} text 
    * @param {String|false} chatId 
    * @param {Object} options 
    */
    m.reply = async (text, jid = m.chat, options) => {
        if (config.composing) {
            await sock.presenceSubscribe(jid)
            await sock.sendPresenceUpdate('composing', jid)
        }
        await sock.sendMessage(jid, { text: text }, { quoted: m, ...options })
    }
    /**
    * Copy this message
    */
    m.copy = () => exports.Serialize(sock, M.fromObject(M.toObject(m)))

    /**
     * 
     * @param {*} jid 
     * @param {*} forceForward 
     * @param {*} options 
     * @returns 
     */
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => sock.copyNForward(jid, m, forceForward, options)
    /**
     * Modify this Message
     * @param {String} jid
     * @param {String} text
     * @param {String} sender
     * @param {Object} options
     */
    m.cMod = (jid, text = '', sender = m.sender, options = {}) => sock.cMod(jid, m, text, sender, options)
    return m
};

exports.checkWAVersion = async () => {
    const { data } = await axios.get('https://web.whatsapp.com/check-update?version=1&platform=web')
    return data.currentVersion.split('.').map(x => parseInt(x))
}
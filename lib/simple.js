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
    toBuffer,
} = require('@adiwajshing/baileys');
const { getBuffer } = require('../utils');


exports.generateUrlInfo = async (jid, text, title, description, jpegThumbnail, quoted = {}) => {
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

/**
 * 
 * @param {proto.IMessage} message 
 * @returns 
 */
exports.downloadMediaMessage = async (message) => {
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
 * @param {WASocket} sock 
 * @param {proto.IWebMessageInfo} m 
 * @returns 
 */
exports.Serialize = (sock, m) => {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBot = (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('3EB') && m.id.length === 20);
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.fromMe
            ? sock.user.id.split(':')[0] + '@s.whatsapp.net' || sock.user.id
            : m.key.participant || m.key.remoteJid;
    }
    if (m.message) {
        m.mtype = Object.keys(m.message)[0];
        m.body = m.message.conversation || m.message[m.mtype].caption || m.message[m.mtype].text || (m.mtype == 'listResponseMessage') && m.message[m.mtype].singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.message[m.mtype].selectedButtonId || m.mtype
        m.msg = m.message[m.mtype];
        if (m.mtype === 'ephemeralMessage') {
            Serialize(sock, m.msg);
            m.mtype = m.msg.mtype;
            m.msg = m.msg.msg;
        }
        let quoted = (m.quoted = m.msg.contextInfo
            ? m.msg.contextInfo.quotedMessage
            : null);
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0];
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
                ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 || (m.id.startsWith('3EB') && m.id.length === 20)
                : false;
            m.quoted.sender =
                m.msg.contextInfo.participant.split(':')[0] ||
                m.msg.contextInfo.participant;
            m.quoted.fromMe = m.quoted.sender === (sock.user && sock.user.id);
            m.quoted.text = m.quoted.text || m.quoted.caption || '';
            m.quoted.mentionedJid = m.msg.contextInfo
                ? m.msg.contextInfo.mentionedJid
                : [];
            let vM = (m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id,
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {}),
            }));
            m.quoted.download = () => sock.downloadMediaMessage(m.quoted);
        }
    }
    if (m.msg.url) m.download = () => sock.downloadMediaMessage(m.msg);
    m.text = (m.mtype == 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '') || (m.mtype == 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId : '') || m.msg.text || m.msg.caption || m.msg || ''
    return m;
};

global.fs = require('fs');
let mime = require('mime-types');
global.util = require('util');
let { promisify } = util
let { resolve } = require('path');
let readdir = promisify(fs.readdir);
let stat = promisify(fs.stat);

const {
    default: makeWASocket,
    proto,
    downloadContentFromMessage,
    MessageType,
    Mimetype,
} = require('@adiwajshing/baileys-md');


Serialize = (client, m) => {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBot = (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('3EB') && m.id.length === 20);
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.fromMe
            ? client.user.id.split(':')[0] + '@s.whatsapp.net' || client.user.id
            : m.key.participant || m.key.remoteJid;
    }
    if (m.message) {
        m.mtype = Object.keys(m.message)[0];
        m.body =
            m.message.conversation ||
            m.message[m.mtype].caption ||
            m.message[m.mtype].text ||
            (m.mtype == 'listResponseMessage' &&
                m.message[m.mtype].singleSelectReply.selectedRowId) ||
            (m.mtype == 'buttonsResponseMessage' &&
                m.message[m.mtype].selectedButtonId) ||
            m.mtype;
        m.msg = m.message[m.mtype];
        if (m.mtype === 'ephemeralMessage') {
            Serialize(client, m.msg);
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
            m.quoted.id = m.msg.contextInfo.stanzaId;
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
            m.quoted.isBot = m.quoted.id
                ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16
                : false;
            m.quoted.sender =
                m.msg.contextInfo.participant.split(':')[0] ||
                m.msg.contextInfo.participant;
            m.quoted.fromMe = m.quoted.sender === (client.user && client.user.id);
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
            m.quoted.download = () => client.downloadMediaMessage(m.quoted);
        }
    }
    if (m.msg.url) m.download = () => client.downloadMediaMessage(m.msg);
    m.text =
        (m.mtype == 'listResponseMessage'
            ? m.message.singleSelectReply.selectedRowId
            : '') ||
        (m.mtype == 'templateButtonReplyMessage'
            ? m.message.templateButtonReplyMessage.selectedId
            : '') ||
        m.msg.text ||
        m.msg.caption ||
        m.msg ||
        '';
    return m;
};

exports.Serialize = Serialize;

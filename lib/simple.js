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

Socket = (...args) => {
    let client = makeWASocket(...args);
    Object.defineProperty(client, 'name', {
        value: 'WASocket',
        configurable: true,
    });

    let parseMention = (text) =>
        [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
            (v) => v[1] + '@s.whatsapp.net'
        );

    client.downloadMediaMessage = async (message) => {
        let mimes = (message.msg || message).mimetype || '';
        let messageType = mimes.split('/')[0].replace('application', 'document')
            ? mimes.split('/')[0].replace('application', 'document')
            : mimes.split('/')[0];
        let extension = mimes.split('/')[1];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };

    client.reply = async (jid, text, quoted, options) => {
        await client.sendPresenceUpdate('composing', jid);
        return client.sendMessage(
            jid,
            {
                text: text,
                contextInfo: { mentionedJid: parseMention(text) },
                ...options,
            },
            { quoted }
        );
    };

    client.sendImage = async (jid, source, text, quoted, options) => {
        let file = Func.uuid() + '.png';
        if (Buffer.isBuffer(source)) {
            fs.writeFileSync('./temp/' + file, source);
            let media = fs.readFileSync('./temp/' + file);
            await client.sendPresenceUpdate('composing', jid);
            client
                .sendMessage(
                    jid,
                    {
                        image: media,
                        caption: text,
                        contextInfo: {
                            mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
                                (v) => v[1] + '@s.whatsapp.net'
                            ),
                        },
                        ...options,
                    },
                    { quoted }
                )
                .then(() => fs.unlinkSync('./temp/' + file));
        } else {
            await Func.download(source, './temp/' + file, async () => {
                let media = fs.readFileSync('./temp/' + file);
                await client.sendPresenceUpdate('composing', jid);
                client
                    .sendMessage(
                        jid,
                        {
                            image: media,
                            caption: text,
                            contextInfo: {
                                mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
                                    (v) => v[1] + '@s.whatsapp.net'
                                ),
                            },
                            ...options,
                        },
                        { quoted }
                    )
                    .then(() => fs.unlinkSync('./temp/' + file));
            });
        }
    };

    client.sendVideo = async (
        jid,
        source,
        text,
        quoted,
        gif = false,
        options
    ) => {
        let file = new Date().getTime() + '.mp4';
        if (Buffer.isBuffer(source)) {
            fs.writeFileSync('./temp/' + file, source);
            let media = fs.readFileSync('./temp/' + file);
            await client.sendPresenceUpdate('composing', jid);
            client
                .sendMessage(
                    jid,
                    { video: media, caption: text, gifPlayback: gif, ...options },
                    { quoted }
                )
                .then(() => fs.unlinkSync('./temp/' + file));
        } else {
            await download(source, './temp/' + file, async () => {
                let media = fs.readFileSync('./temp/' + file);
                await client.sendPresenceUpdate('composing', jid);
                client
                    .sendMessage(
                        jid,
                        { video: media, caption: text, gifPlayback: gif, ...options },
                        { quoted }
                    )
                    .then(() => fs.unlinkSync('./temp/' + file));
            });
        }
    };

    client.sendAudio = async (jid, source, voice = false, quoted, options) => {
        let file = Func.uuid() + '.mp3';
        if (Buffer.isBuffer(source)) {
            fs.writeFileSync('./temp/' + file, source);
            let media = fs.readFileSync('./temp/' + file);
            await client.sendPresenceUpdate(voice ? 'recording' : 'composing', jid);
            client
                .sendMessage(jid, { audio: media, ptt: voice, ...options }, { quoted })
                .then(() => fs.unlinkSync('./temp/' + file));
        } else {
            await Func.download(source, './temp/' + file, async () => {
                let media = fs.readFileSync('./temp/' + file);
                await client.sendPresenceUpdate(voice ? 'recording' : 'composing', jid);
                client
                    .sendMessage(
                        jid,
                        { audio: media, ptt: voice, ...options },
                        { quoted }
                    )
                    .then(() => fs.unlinkSync('./temp/' + file));
            });
        }
    };

    client.sendDocument = async (jid, source, name, quoted, options) => {
        let getExt = name.split('.');
        let ext = getExt[getExt.length - 1];
        if (Buffer.isBuffer(source)) {
            fs.writeFileSync('./temp/' + name.replace(/(\/)/g, '-'), source);
            let media = fs.readFileSync('./temp/' + name.replace(/(\/)/g, '-'));
            await client.sendPresenceUpdate('composing', jid);
            client
                .sendMessage(
                    jid,
                    {
                        document: media,
                        fileName: name,
                        mimetype:
                            typeof mime.lookup(ext) != 'undefined'
                                ? mime.lookup(ext)
                                : mime.lookup('txt'),
                    },
                    { quoted: m }
                )
                .then(() => fs.unlinkSync('./temp/' + name.replace(/(\/)/g, '-')));
        } else {
            await Func.download(
                source,
                './temp/' + name.replace(/(\/)/g, '-'),
                async () => {
                    let media = fs.readFileSync('./temp/' + name.replace(/(\/)/g, '-'));
                    await client.sendPresenceUpdate('composing', jid);
                    client
                        .sendMessage(
                            jid,
                            {
                                document: { url: source },
                                fileName: name,
                                mimetype: typeof mime.lookup(ext)
                                    ? mime.lookup(ext)
                                    : mime.lookup('txt'),
                            },
                            { quoted: m }
                        )
                        .then(() => fs.unlinkSync('./temp/' + name.replace(/(\/)/g, '-')));
                }
            );
        }
    };

    client.buttonLoc = async (jid, text, footer, buttons = []) => {
        let btnMsg = {
            caption: text,
            footer: footer,
            templateButtons: buttons,
            location: { jpegThumbnail: await Func.fetchBuffer(global.cover) },
        };
        await client.sendPresenceUpdate('composing', jid);
        client.sendMessage(jid, btnMsg);
    };

    return client;
};

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

Scandir = async (dir) => {
    let subdirs = await readdir(dir);
    let files = await Promise.all(
        subdirs.map(async (subdir) => {
            let res = resolve(dir, subdir);
            return (await stat(res)).isDirectory() ? Scandir(res) : res;
        })
    );
    return files.reduce((a, f) => a.concat(f), []);
};

exports.Socket = Socket;
exports.Serialize = Serialize;
exports.Scandir = Scandir;

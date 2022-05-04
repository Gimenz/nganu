const Wattpad = require('wattpad.js');
const wattpad = new Wattpad()
const tanda = '```'

module.exports = {
    tags: ['fun'],
    cmd: ['wattpad'],
    args: ['query'],
    help: ['wattpad'],
    exec: async (m, client, { prefix, args, cmd, url }) => {
        if (args.length < 1) return m.reply('query diperlukan')
        try {
            if (args[0] == 'detail') {
                const data = await wattpad.Stories.detail(args.slice(1).join(' '))
                let arr = data.parts
                let list = new Array();
                for (let i = 0; i < arr.length; i++) {
                    list.push({
                        title: `Chapter : ${arr[i].title}`,
                        description: `ID : ${arr[i].id}\nUpdated on : ${moment(arr[i].modifyDate).format('MMM DD, YYYY')}\nComments : ${arr[i].commentCount}\nVote : ${arr[i].voteCount}\nReaders : ${arr[i].readCount}`,
                        rowId: `${prefix}wattpad read ${arr[i].id}`
                    });
                }
                let text = `*${data.title}*\n\n` +
                    `Written by *${data.user.fullname}* - *@${data.user.user}*\n` +
                    `Reader : *${data.readCount}*\n` +
                    `Comment : *${data.commentCount}*\n` +
                    `Chapter : *${data.numParts}*\n\n` +
                    `"${tanda}${data.description}${tanda}"`
                await client.sendFileFromUrl(m.chat, data.cover, text, m)
                await delay(3000)
                await client.sendListM(m.chat,
                    { buttonText: 'Chapter List', description: 'Baca chapter hanya dengan klik salah satu tombol pada list', title: 'Silahkan Pilih' },
                    list, m
                )
            } else if (args[0] == 'next') {
                const data = await wattpad.Stories.nextHandler(args.slice(1).join(' '))
                let arr = data.stories
                let list = new Array();
                for (let i = 0; i < arr.length; i++) {
                    list.push({
                        title: arr[i].title,
                        description: `Author : ${arr[i].user.name}\nList Chapter : ${arr[i].numParts}\nPosted at : ${moment(arr[i].lastPublishedPart.createDate).format('DD/MM/YY')}\n`,
                        rowId: `${prefix}wattpad detail ${arr[i].id}`
                    });
                }
                if (!arr.length < 1) {
                    list.push({
                        title: `Next Page >> ${Number(/offset=(\d)/.exec(data.nextUrl)[1]) - 1}`,
                        description: 'Go To next page',
                        rowId: `${prefix}wattpad next ${data.nextUrl}`
                    })
                }
                await client.sendListM(m.chat,
                    { buttonText: 'Pilih Cerita', description: 'Wattpad Scraper', title: `📔 Wattpad Search Page ${Number(/offset=(\d)/.exec(data.nextUrl)[1]) - 2}` },
                    list, m
                )
            } else if (args[0] == 'read') {
                const data = await wattpad.Stories.read(args.slice(1).join(' '))
                m.reply(data.text)
            } else if (!/read|next|detail/i.test(args[0])) {
                const data = await wattpad.Stories.search(args.join(' '))
                let arr = data.stories
                let list = new Array();
                for (let i = 0; i < arr.length; i++) {
                    list.push({
                        title: arr[i].title,
                        description: `Author : ${arr[i].user.name}\nList Chapter : ${arr[i].numParts}\nPosted at : ${moment(arr[i].lastPublishedPart.createDate).format('DD/MM/YY')}\n`,
                        rowId: `${prefix}wattpad detail ${arr[i].id}`
                    });
                }
                list.push({
                    title: `Next Page >> ${Number(/offset=(\d)/.exec(data.nextUrl)[1])}`,
                    description: 'Go To next page',
                    rowId: `${prefix}wattpad next ${data.nextUrl}`
                })
                await client.sendListM(m.chat,
                    { buttonText: 'Pilih Cerita', description: `*Wattpad Scraper*\n\nDitemukan *${data.total}* Cerita\n\n*tags :* [ ${data.tags.map(x => x.id).join(', ')} ] `, title: `📔 Wattpad Search` },
                    list, m
                )
            }
        } catch (error) {
            console.log(error);
            m.reply('error banh')
        }

    }
}
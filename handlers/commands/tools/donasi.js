module.exports = {
    tags: ['others', 'information'],
    cmd: ['donasi', 'donate'],
    help: ['donasi'],
    exec: (m, client) => {
        let caption = `Hai *${client.pushname}* 👋
Bot ini membutuhkan server agar bisa on 24 jam dan memproses request kamu dengan cepat, maka dari itu jika berkenan donasi seikhlasnya buat biaya server

Total biaya yang diperlukan adalah kurang lebih 150K per bulan :)

*E-Wallet :*
[ 085236189413 ] - A.N *Muhamad Ristiyanto*
- DANA | OVO | GOPAY | SHOPEEPAY | LinkAja

atau juga bisa via QRIS jika akun e-wallet kamu belum upgrade ke premium
`
        const btn = [
            { urlButton: { displayText: `😊 Saweria`, url: `https://saweria.co/masgimenz` } },
            { quickReplyButton: { displayText: `QRIS`, id: `${prefix}qris` } },
        ]
        client.sendMessage(m.chat, { text: caption, footer: `© 2020 - @mg.bot`, templateButtons: btn }, { quoted: m })
    }
}
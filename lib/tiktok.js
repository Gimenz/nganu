const { fetchAPI } = require('../utils/function.js')

async function tiktokDL(ling) {
    try {
        let { data } = await axios.get(API['masgi'] + '/tiktok/?url=' + ling).catch(e => console.log(e))
        if (data.status_code !== 0) return ({
            status: false,
            creator: '@gimenz.id',
            code: 404,
            result: data.status_msg
        });
        let sesi = data.aweme_details[0]
        return {
            id: sesi.aweme_id,
            desc: sesi.desc,
            create_time: sesi.create_time,
            authorMeta: {
                username: sesi.author.unique_id,
                nickname: sesi.author.nickname,
                user_id: sesi.author.uid,
                avatar: sesi.author.avatar_larger.url_list[sesi.author.avatar_larger.url_list - 1],
                signature: sesi.author.signature
            },
            musicMeta: sesi.music,
            cover: sesi.video.cover,
            duration: sesi.video.duration,
            videoUrl: {
                url_list: sesi.video.download_addr.url_list,
                filesize: (sesi.video.download_addr.data_size / 1048576).toFixed(2) + ' MB'
            },
            videoUrlNoWatermark: {
                url_list: sesi.video.play_addr.url_list,
                filesize: (sesi.video.play_addr.data_size / 1048576).toFixed(2) + ' MB',
                width: sesi.video.play_addr.width,
                height: sesi.video.play_addr.height,
            },
            statistics: sesi.statistics
        }
    } catch (error) {
        console.log(error);
        return {
            status: false,
            creator: '@gimenz.id',
            code: 404,
            result: 'Can\'t fetch metadata!'
        };
    }
}

module.exports = {
    tiktokDL
};

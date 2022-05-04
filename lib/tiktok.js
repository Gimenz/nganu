const { default: axios } = require('axios');
const { randomInt } = require('crypto');
const _ = require('lodash');

const BASE_URL = 'https://m.tiktok.com/';

const TRENDING_URL = `${BASE_URL}api/recommend/item_list/`;
const HASHTAG_URL = `${BASE_URL}api/challenge/item_list/`;
const HASHTAG_DESCRIPTION_URL = `${BASE_URL}node/share/tag/`;
const SEARCH_URL = 'https://t.tiktok.com/api/search/item/full/'

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
}

// https://github.com/drawrowfly/tiktok-scraper/blob/ad0e046371b4206e964e7532dcda09ce26aea639/src/helpers/Random.ts#L19
const makeVerifyFp = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charlen = chars.length;
    const time = Buffer.from(new Date().getTime().toString()).toString('base64');
    const arr = '0'.repeat(36).split('');
    arr[8] = '_';
    arr[13] = '_';
    arr[18] = '_';
    arr[23] = '_';
    arr[14] = '4';
    const str = arr.map(x => (x === '0' ? chars.charAt(Math.floor(Math.random() * charlen)) : x)).join('');
    return `verify_${time.toLowerCase()}_${str}`;
};

const defaultParams = () => ({
    aid: 1988,
    // verifyFp: makeVerifyFp(),//'verify_kvfr3riz_HLYxKN3N_v4jk_4hWM_86jq_mrti859vrj0R',
    // app_name: 'tiktok_web',
    // device_platform: 'web_mobile',
    // screen_width: '1920',
    // screen_height: '1080',
    // region: 'ID',
    // language: 'id',
    // priority_region: '',
    // os: 'android',
    // referer: '',
    // root_referer: '',
    // cookie_enabled: 'true',
    // browser_language: 'en-us',
    // browser_platform: 'android',
    // browser_name: 'Mozilla',
    // browser_version: '5.0+(Linux%3B+Android+6.0%3B+Nexus+5+Build%2FMRA58N)+AppleWebKit%2F537.36+(KHTML,+like+Gecko)+Chrome%2F95.0.4638.54+Mobile+Safari%2F537.36',
    // browser_online: 'true',
    // timezone_name: 'Asia/Jakarta',
    // is_page_visible: 'true',
    // focus_state: 'true',
    // is_fullscreen: 'false',
    // history_len: Math.floor(Math.random() * 30)
});

const getHashtagParams = (challengeID) => ({
    ...defaultParams(),
    challengeID,
    count: 24,
    cursor: 1
});

const getHashtagDescription = async (tag) => {
    const { data } = await axios.get(HASHTAG_DESCRIPTION_URL + tag, { headers, withCredentials: true })
    return data
}


class SimpleTikApi {
    constructor() { }

    /**
     * 
     * @param {string} tag tiktok hashtag
     * @param {'date'|'views'|'followers'|'shuffle'} sortBy `date`
     * @returns 
     */
    static hashtag = async (tag, sortBy = '') => {
        const { statusCode, challengeInfo } = await getHashtagDescription(tag);

        if (statusCode !== 0) {
            return []
        }
        const response = await axios.get(HASHTAG_URL, {
            params: getHashtagParams(challengeInfo.challenge.id),
        });
        if (!response.data.hasOwnProperty('itemList')) throw 'not found'
        let data = response.data.itemList

        if (sortBy == 'date') {
            data.sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
            return data
        } else if (sortBy == 'views') {
            return data.sort((a, b) => a.stats.playCount - b.stats.playCount)
        } else if (sortBy == 'followers') {
            return data.sort((a, b) => a.authorStats.followerCount - b.authorStats.playCount)
        } else if (sortBy == 'shuffle' || sortBy == 'random') {
            return _.shuffle(data)
        } else {
            return data
        }
    }

    static search = async (keyword, count = 20, offset = 0) => {
        const params = {
            from_page: 'search',
            keyword,
            offset,
            count,
            region: 'ID',
            tz_name: 'Asia/Jakarta',
            verifyFp: makeVerifyFp(),
        }
        const { data } = await axios.get(SEARCH_URL, {
            params,
            headers: {
                'cookie': 'sid_guard=67ec94ecdda45f9d1e487d0f2adf39a7|1640111802|5184000|Sat,+19-Feb-2022+18:36:42+GMT; s_v_web_id=verify_kxgg6tz9_vRoIvzrX_JFRO_43XW_BLWl_sNix1YhnegWI; tt_csrf_token=U7bXkoNT-4HiPUoyHnbzwAIdOUpCOl2fFqf0; _abck=1F49C7BF73F54640C4B02DAD9631667C~-1~YAAQLzwxF9qIwV6AAQAA0/w/awc2D5NorCVZbscRyZSrSdcR6OONovroK/Q33h3tn+APwfPdQ2YkE34PeVrcXrGtGYvOwFpdgANEYSQAVWU9WyV2SCb6yV1U5D+GL8mJ4BJ6kneAQo8Z8o2Lk4u/rWzLWQ9E9lE/6BWekfWUs6FjMkep+YMlKhHDWzbXYO8gerUUTP8rae26MAfsNPAT/oYeZrAwIdIRPy2yfrFUh4OjH6+p2FIsuKlOuLptAdJhQ6HVnXRZhoNhpLFuhjULeHCxKfmLGAffiZROizoAiSs2LOQGKBZ8y5aM9SGu7VT4us5gdtxrngA30Vk4iRzkfD5GsI7NrZUveR6qeFJehVZrvL/Pwh79pgZxHcElTht1jbNWwKhl3VEZxQ==~-1~-1~-1; ak_bmsc=9E38AA28B68BD2BE4814940E65CF29C1~000000000000000000000000000000~YAAQLzwxF9uIwV6AAQAA0/w/aw+0htQ7zBKkBxhN00Rh6+YGK6j7bwR9WCoP85ssPIn73JFjKxwEwU/vAozKdQssEEIzdDsOpuL8ZR/R/rCIOtmyK2vM8wUFoKPvq8XXFeYVsDyuR88HL3pM6KEADCFe/WdyJEc8O14al6Ehc3b6fRcxpsif2D+anStEOx/BqDO9/sAB1puw5TL6y6qKKV/FW45XYhW95VG/ocIyB0/mqQDYqYABvvEAZfwptAsft3siiYKKYL5o91Bt+qKMuu5puX9cuDKAccwHORcJ7vmiJskA6D2YH6UswEF8+hEUwEQQjBHRjeEJMD44tZqs1mm46shmv+nnjG6KecmkMVBJhae06T/px2g6ZHA1rFYPHsFGa44egrbIYEo=; bm_sz=72EF5FC887B23465865325827624C248~YAAQLzwxF9yIwV6AAQAA0/w/aw+JixvDnF0yiD1dV8x74ldktLmTnNhxEGOr0jTbh8jt+rCGJPw/cWANUD61PED4S/GQ7Te8G/ue73o1JJC/3jT/S4yX2vBg07DHmuGk9ZDzCL4avPuICuUF8ANPLKH/2LVpii7WSxd7azaeoQLHzpagi7Eqq7h/eOBkUR9uxD+Dgf/fE1h064EiSHvcqSWXnuekqW0G9NERxB5xgrj9/Lh/oI2uppeFVMhhJWsYmbdYeKH4STNL4pkUTDlfgscRo+JDqx2Gudj+G7Niezu6rWo=~4274483~4473650; odin_tt=ba7e4302af60689413d5046acbfb5788bbde1099819649f675e0962ac8bc6a0f4ad4fb6843594d752b4d62fe3779241ea46088908801e54523061becdc72467942760baca04044e2ca6afc7ce4139c57; msToken=Nuqy42OGir2ITZX43nTZ1JUAS2F0ykyhDkWZX38Q73fb_1q1AX-cqzYDEZxi9kCxXxtixerkwnB6FIRy42xCi_Kfmbpam3_FiywiieI6gZTe1Bb9bq-OwYS1cbwo6Q==; bm_mi=248A02A5F7FCB7B147A0DA2D2BA8B879~k6LwJs9wXwOy6xNaZ2/Ocu/uIi6dpkJQIrliYVhYfVi1+RbyC7a7xaIAFdNc+ScrAdaa+fRmWrrw3RDkWTKwHvpExkS98C/Jv53voK4LoX7p0dl0efvQYpTOpX/nM9T3z+A/u/g16g4gtPjgvSVyhvk6BFk9wvFCyMDuGzt9p3i7VcmYZZ9DoNGaisJpZri+qV2dyfnrV8lwLvapD3tfyh5BaOB4EpT9rTBizVS4qi4=; bm_sv=87EF0D8FA0A4A120ACE91DD92CE5326E~Wxxs8K+EXW6sNps6rpi8HjVLbXGcpJg11yFfPmN56X6KJlLzX/0jsFNgKcZxp8sn+4rpy1QPcXw82Mca0cYHhnTnc40j+pfw8nBA0xzc/H4kxgko40006XkkwV55lmJM84vUi605IavMqMZCAx2x2LiG4ANwt2+fnrKjpEJVXzY=; ttwid=1|AM-ua4qD3yJ_8skaWIjYWmfLwD9dgPyvQ_ErEtvl_RM|1651067080|40a631f4de9f6a304ba87c3925f8d0bccabb6817f3a716b5374215de9eadf353'
            }
        })

        return data.item_list
    }

    static shorten = async (url) => {
        const { data } = await axios.get('https://tokurlshortener.com/api/shorten?url=' + url)
        return data
    }

    static user = async (username) => {
        const { data } = await axios.get(`https://www.tiktok.com/@${encodeURI(username)}?lang=en`, {
            headers
        });
        const json = data.split('<script id="SIGI_STATE" type="application/json">')[1].split('</script>')[0]
        return JSON.parse(json)
    }

    static getVideoByUsername = async (username) => {
        const json = await SimpleTikApi.user(username)
        return Object.entries(json.ItemModule).map(x => x[1])
    }
}

//SimpleTikApi.search('mie ayam', 50, randomInt(20)).then(console.log)

module.exports = {
    SimpleTikApi
}
const { default: axios } = require('axios')
const _ = require('lodash')

const BASE_URL = 'https://m.tiktok.com/';

const TRENDING_URL = `${BASE_URL}api/recommend/item_list/`;
const HASHTAG_URL = `${BASE_URL}api/challenge/item_list/`;
const HASHTAG_DESCRIPTION_URL = `${BASE_URL}node/share/tag/`;

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

/**
 * 
 * @param {string} tag tiktok hashtag
 * @param {'date'|'views'|'followers'|'shuffle'} sortBy `date`
 * @returns 
 */
const getHashtagVideo = async (tag, sortBy = '') => {
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
};

const shorten = async (url) => {
    const { data } = await axios.get('https://tokurlshortener.com/api/shorten?url=' + url)
    return data
}

getHashtagVideo('inspirasiseruramadhan ')

module.exports = {
    getHashtagVideo,
    shorten
}
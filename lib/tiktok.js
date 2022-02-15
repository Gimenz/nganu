const { default: axios } = require('axios')
const _ = require('lodash')

const BASE_URL = 'https://m.tiktok.com/';

const TRENDING_URL = `${BASE_URL}api/recommend/item_list/`;
const HASHTAG_URL = `${BASE_URL}api/challenge/item_list/`;
const HASHTAG_DESCRIPTION_URL = `${BASE_URL}node/share/tag/`;

const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Mobile Safari/537.36'
}

const defaultParams = () => ({
    aid: 1988,
    verifyFp: 'verify_kvfr3riz_HLYxKN3N_v4jk_4hWM_86jq_mrti859vrj0R',
    app_name: 'tiktok_web',
    device_platform: 'web_mobile',
    screen_width: '1920',
    screen_height: '1080',
    region: 'ID',
    language: 'id',
    priority_region: '',
    os: 'ios',
    referer: '',
    root_referer: '',
    cookie_enabled: 'true',
    browser_language: 'en-us',
    browser_platform: 'iPhone',
    browser_name: 'Mozilla',
    browser_version: '5.0+(Linux%3B+Android+6.0%3B+Nexus+5+Build%2FMRA58N)+AppleWebKit%2F537.36+(KHTML,+like+Gecko)+Chrome%2F95.0.4638.54+Mobile+Safari%2F537.36',
    browser_online: 'true',
    timezone_name: 'Asia/Jakarta',
    is_page_visible: 'true',
    focus_state: 'true',
    is_fullscreen: 'false',
    history_len: Math.floor(Math.random() * 30)
});

const getHashtagParams = (challengeID) => ({
    ...defaultParams(),
    challengeID,
    count: 24,
    cursor: 4
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
    const response = await axios(HASHTAG_URL, {
        headers,
        params: getHashtagParams(Number(challengeInfo.challenge.id)),
        withCredentials: true
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

module.exports = {
    getHashtagVideo,
    shorten
}
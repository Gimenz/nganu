const chalk = require('chalk');
global.moment = require('moment-timezone');
//const { fetchText } = require('./fetcher')
moment.tz.setDefault('Asia/Jakarta').locale('id');
global.axios = require('axios').default;
global.config = require('../src/config.json')
global.API = config.api

/**
 * Get text with color
 * @param  {String} text
 * @param  {String} color
 * @return  {String} Return text with color
 */
const color = (text, color) => {
	return !color ? chalk.green(text) : color.startsWith('#') ? chalk.hex(color)(text) : chalk.keyword(color)(text);
};

/**
 * coloring background
 * @param {string} text
 * @param {string} color
 * @returns
 */
function bgColor(text, color) {
	return !color
		? chalk.bgGreen(text)
		: color.startsWith('#')
			? chalk.bgHex(color)(text)
			: chalk.bgKeyword(color)(text);
}

/**
 * Get Time duration
 * @param  {Date} timestamp
 * @param  {Date} now
 */
const processTime = (timestamp, now) => {
	// timestamp => timestamp when message was received
	return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};
/**
 * is it url?
 * @param  {String} url
 */
const isUrl = (url) => {
	return url.match(
		new RegExp(
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi
		)
	);
};

const msgs = (message) => {
	if (message.length >= 10) {
		return `${message.substr(0, 500)}`;
	} else {
		return `${message}`;
	}
};

/**
 * @internal
 * A convinience method to download the [[DataURL]] of a file
 * @param url The url
 * @param optionsOverride You can use this to override the [axios request config](https://github.com/axios/axios#request-config)
 * @returns
 */
async function getBuffer(url, optionsOverride = {}) {
	try {
		const attachment = await axios
			.get(url, {
				responseType: 'arraybuffer',
				...optionsOverride,
			})
			.then((response) => {
				return {
					mimetype: response.headers['content-type'],
					buffer: response.data,
				};
			});
		return attachment;
		// return Buffer.from(response.data, 'binary').toString('base64')
	} catch (error) {
		console.log('TCL: getDUrl -> error', error);
	}
}

/**
 * Format bytes as human-readable text.
 * copied from -> https://stackoverflow.com/a/14919494s
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes, si = false, dp = 1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}

	const units = si
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * r) / r >= thresh &&
		u < units.length - 1
	);

	return bytes.toFixed(dp) + ' ' + units[u];
}

async function fetchAPI(api, params, options = {}) {
	try {
		const { data } = await axios.get(global.API[api] + params, { ...options });
		return data;
	} catch (error) {
		throw new Error(error);
	}
}

const formatIGUrl = (url) => {
	const reg = new RegExp(/(?:https?:\/\/)?(?:www\.)?(?:instagram\.com(?:\/\w+)?\/(p|reel|tv)\/)([\w-]+)(?:\/)?(\?.*)?$/, 'g').exec(url)
	return `https://www.instagram.com/${reg[1]}/${reg[2]}`
}

module.exports = {
	processTime,
	isUrl,
	bgColor,
	color,
	msgs,
	getBuffer,
	humanFileSize,
	fetchAPI,
	formatIGUrl
};

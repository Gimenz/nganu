/**
 * Author  : Gimenz
 * Name    : nganu
 * Version : 1.0
 * Update  : 09 Januari 2022
 * 
 * If you are a reliable programmer or the best developer, please don't change anything.
 * If you want to be appreciated by others, then don't change anything in this script.
 * Please respect me for making this tool from the beginning.
 */

const { S_WHATSAPP_NET } = require('@adiwajshing/baileys-md');
const chalk = require('chalk');
global.moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta').locale('id');
global.axios = require('axios').default;
global.config = require('../src/config.json')
global.API = config.api
global.db = []

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
	return new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi).test(url)
};

/**
 * cut msg length
 * @param {string} message 
 * @returns 
 */
const msgs = (message) => {
	if (message.length >= 20) {
		return `${message.substring(0, 500)}`;
	} else {
		return `${message}`;
	}
};

/**
 * @internal
 * A convinience method to download the [[DataURL]] of a file
 * @param input The url or path
 * @param optionsOverride You can use this to override the [axios request config](https://github.com/axios/axios#request-config)
 * @returns
 */
async function getBuffer(input, optionsOverride = {}) {
	try {
		if (fs.existsSync(input)) {
			return {
				mimetype: mime.lookup(input),
				buffer: fs.readFileSync(input)
			}
		} else {
			const response = await axios.get(input, {
				responseType: 'arraybuffer',
				...optionsOverride,
			})
			return {
				mimetype: response.headers['content-type'],
				buffer: response.data,
			};
		}
		// return Buffer.from(response.data, 'binary').toString('base64')
	} catch (error) {
		console.log('TCL: getDUrl -> error', error);
	}
}

/**
 * Format bytes as human-readable text.
 * copied from -> https://stackoverflow.com/a/14919494
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

/**
 * 
 * @param {string} api 
 * @param {string} params 
 * @param {Object} options 
 * @returns 
 */
async function fetchAPI(api, params, options = {}) {
	try {
		const { data } = await axios.get(global.API[api] + params, { ...options });
		return data;
	} catch (error) {
		throw new Error(error);
	}
}

const formatPhone = function (number) {
	let formatted = number.replace(/\D/g, '');
	if (formatted.startsWith('0')) {
		formatted = formatted.substr(1) + S_WHATSAPP_NET;
	} else if (formatted.startsWith('62')) {
		formatted = formatted.substr(2) + S_WHATSAPP_NET;
	}
	return number.endsWith(S_WHATSAPP_NET) ? number : formatted;
}

function shrt(url, ...args) {
	// source -> https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < 5; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	let id = result;

	let data = {
		id,
		url,
	}
	Object.assign(data, ...args)
	if (db.some(x => x.url == url)) return data
	db.push(data);
	return data
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
	formatPhone,
	shrt
};

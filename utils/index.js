/**
 * Author  : Gimenz
 * Name    : nganu
 * Version : 1.0
 * Update  : 27 Januari 2022
 * 
 * If you are a reliable programmer or the best developer, please don't change anything.
 * If you want to be appreciated by others, then don't change anything in this script.
 * Please respect me for making this tool from the beginning.
 */

const { S_WHATSAPP_NET } = require('@adiwajshing/baileys');
let package = require('../package.json')
const { randomBytes } = require('crypto');
const fs = require('fs')
const path = require('path')
const chalk = require('chalk');
global.moment = require('moment-timezone');
const mime = require('mime-types');
moment.tz.setDefault('Asia/Jakarta').locale('id');
const FormData = require('form-data')
const { default: axios, AxiosRequestConfig } = require('axios');
const { default: got } = require('got')
const { fromBuffer } = require('file-type');
global.axios = axios
global.config = require('../src/config.json')
global.API = config.api
global.tempDB = []

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
 * @param {string}input The url or path
 * @param {AxiosRequestConfig} optionsOverride You can use this to override the [axios request config](https://github.com/axios/axios#request-config)
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
function humanFileSize(bytes, si = true, dp = 1) {
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
 * @param {AxiosRequestConfig} options 
 * @returns
 */
async function fetchAPI(api, params, options = {}) {
	try {
		const res = await axios({
			url: (global.API[api] || api) + params,
			method: options.method || 'GET',
			data: options.data,
			...options
		})
		//const { data } = await axios.get(global.API[api] || api + params, { ...options });
		return res.data;
	} catch (error) {
		throw new Error(error);
	}
}

async function fetchFilesize(url, options = {}) {
	try {
		const data = await axios.get(url, ...options)
		return data.headers['content-length']
	} catch (error) {
		throw error
	}
}

const formatPhone = function (number) {
	let formatted = number.replace(/\D/g, '');
	if (formatted.startsWith('0')) {
		formatted = formatted.substr(1) + S_WHATSAPP_NET;
	} else if (formatted.startsWith('62')) {
		formatted = formatted.substr(2) + S_WHATSAPP_NET;
	}
	return number.endsWith(S_WHATSAPP_NET) ? number : '62' + formatted;
}

function shrt(url, ...args) {
	let id = randomBytes(32).toString('base64').replace(/\W\D/gi, '').slice(0, 5);

	let data = {
		id,
		url,
	}
	Object.assign(data, ...args)
	if (tempDB.some(x => x.url == url)) return data
	tempDB.push(data);
	return data
}

// source -> https://stackoverflow.com/a/52560608
function secondsConvert(seconds, hour = false) {
	const format = val => `0${Math.floor(val)}`.slice(-2)
	const hours = seconds / 3600
	const minutes = (seconds % 3600) / 60
	const res = hour ? [hours, minutes, seconds % 60] : [minutes, seconds % 60]

	return res.map(format).join(':')
}

function randRGB() {
	const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
	return {
		r: randomBetween(0, 255),
		g: randomBetween(0, 255),
		b: randomBetween(0, 255),
		a: randomBetween(0, 255)
	}
}

/**
 * upload Image to telegra.ph
 * @param {Buffer|string} buffer Buffer or filepath
 * @returns 
 */
const uploadImage = async (buffer) => {
	buffer = Buffer.isBuffer(buffer) ? buffer : fs.existsSync(buffer) ? fs.readFileSync(buffer) : buffer
	const { ext } = await fromBuffer(buffer);
	const form = new FormData()
	form.append('file', buffer, 'tmp.' + ext);
	const res = await axios.post('https://telegra.ph/upload', form, {
		headers: form.getHeaders()
	})
	const img = await res.data
	if (img.error) throw img.error
	return 'https://telegra.ph' + img[0].src
}

/**
 * is tiktok video url?
 * @param {string} link 
 * @returns 
 */
async function isTiktokVideo(link) {
	const a = await got.get(link)
	let url = new URL(a.redirectUrls[0])
	return {
		isVideo: !isNaN(path.basename(url.pathname)),
		isUser: path.basename(url.pathname).startsWith('@'),
		url: url.origin + url.pathname,
		pathname: url.pathname
	}
}

async function isLatestVersion() {
	try {
		const { body } = await got.get('https://raw.githubusercontent.com/Gimenz/nganu/master/package.json')
		return {
			isLatest: true,
			version: JSON.parse(body).version
		}
	} catch (error) {
		return {
			isLatest: false,
			version: package.version,
			error
		}
	}
}

function formatK(number, locale = 'id-ID') {
	return new Intl.NumberFormat(locale, { notation: 'compact' }).format(number)
}

const Scandir = (dir) => {
	let subdirs = fs.readdirSync(dir)
	let files = subdirs.map((sub) => {
		let res = path.join(dir, sub)
		return fs.statSync(res).isDirectory() ? Scandir(res) : res
	});

	return files.reduce((a, f) => a.concat(f), [])
}

const pluginLoader = (dir) => {
	let pluginFolder = path.join(__dirname, dir)
	let pluginFilter = filename => /\.js$/.test(filename)

	let plugins = {}

	for (let filelist of Scandir(pluginFolder).filter(pluginFilter)) {
		filename = path.basename(filelist, '.js')
		try {
			plugins[filename] = require(filelist)
		} catch (e) {
			delete plugins[filename]
		}
	}
	return plugins
}

/**
 * mask an string // string = st**ng
 * @param {string} str 
 * @returns 
 */
function maskStr(str) {
	var first4 = str.substring(0, 4);
	var last5 = str.substring(str.length - 2);

	mask = str.substring(4, str.length - 2).replace(/\d/g, "*");
	return first4 + mask + last5
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
	shrt,
	secondsConvert,
	randRGB,
	uploadImage,
	isTiktokVideo,
	formatK,
	Scandir,
	pluginLoader,
	maskStr,
	fetchFilesize,
	isLatestVersion
};

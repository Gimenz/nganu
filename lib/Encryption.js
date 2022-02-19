/**
 * @author Conner
 * @since 23/07/21
 */

// Dependencies
const crypto = require("crypto");

// Variables
const EMPTY_STR = "00000000000000000000000000000000";
let byteTable = [
    "D6", "28", "3B", "71", "70", "76", "BE", "1B", "A4", "FE", "19", "57", "5E", "6C", "BC",
    "21", "B2", "14", "37", "7D", "8C", "A2", "FA", "67", "55", "6A", "95", "E3", "FA", "67",
    "78", "ED", "8E", "55", "33", "89", "A8", "CE", "36", "B3", "5C", "D6", "B2", "6F", "96",
    "C4", "34", "B9", "6A", "EC", "34", "95", "C4", "FA", "72", "FF", "B8", "42", "8D", "FB",
    "EC", "70", "F0", "85", "46", "D8", "B2", "A1", "E0", "CE", "AE", "4B", "7D", "AE", "A4",
    "87", "CE", "E3", "AC", "51", "55", "C4", "36", "AD", "FC", "C4", "EA", "97", "70", "6A",
    "85", "37", "6A", "C8", "68", "FA", "FE", "B0", "33", "B9", "67", "7E", "CE", "E3", "CC",
    "86", "D6", "9F", "76", "74", "89", "E9", "DA", "9C", "78", "C5", "95", "AA", "B0", "34",
    "B3", "F2", "7D", "B2", "A2", "ED", "E0", "B5", "B6", "88", "95", "D1", "51", "D6", "9E",
    "7D", "D1", "C8", "F9", "B7", "70", "CC", "9C", "B6", "92", "C5", "FA", "DD", "9F", "28",
    "DA", "C7", "E0", "CA", "95", "B2", "DA", "34", "97", "CE", "74", "FA", "37", "E9", "7D",
    "C4", "A2", "37", "FB", "FA", "F1", "CF", "AA", "89", "7D", "55", "AE", "87", "BC", "F5",
    "E9", "6A", "C4", "68", "C7", "FA", "76", "85", "14", "D0", "D0", "E5", "CE", "FF", "19",
    "D6", "E5", "D6", "CC", "F1", "F4", "6C", "E9", "E7", "89", "B2", "B7", "AE", "28", "89",
    "BE", "5E", "DC", "87", "6C", "F7", "51", "F2", "67", "78", "AE", "B3", "4B", "A2", "B3",
    "21", "3B", "55", "F8", "B3", "76", "B2", "CF", "B3", "B3", "FF", "B3", "5E", "71", "7D",
    "FA", "FC", "FF", "A8", "7D", "FE", "D8", "9C", "1B", "C4", "6A", "F9", "88", "B5", "E5"
];

// Encryption Class
class Encryption {
    /**
     * @param {String} string 
     * @returns {String}
     */
    static md5 = string => crypto.createHash("md5").update(string).digest("hex");

    /**
     * @param {String} string 
     * @returns {Object}
     */
    static toByteArr(string) {
        let arr = [];

        for (let i = 0; i < string.length; i += 2)
            arr.push(((parseInt(string[i], 16)) << 4) + (parseInt(string[i + 1], 16)));

        return arr;
    }

    /**
     * @param {Object} bytes 
     * @param {String|Number} time 
     * @returns {Object}
     */
    static calculate(bytes, time) {
        let data = ["3", "61", "41", "10", "80", "0"], _bytes = [], _hex = 0, str = "";

        for (let i = 0; i < 4; i++) {
            if (bytes[i] > 0)
                _bytes.push((bytes[i]).toString(16));
            else _bytes.push("0");
        }

        _bytes = _bytes.concat(["0", "0", "0", "0"]);

        for (let i = 0; i < 4; i++) {
            if (bytes[i + 32] > 0)
                _bytes.push((bytes[i + 32]).toString(16));
            else _bytes.push("0");
        }

        _bytes = _bytes.concat(["0", "0", "0", "0"]);
        _bytes = _bytes.concat((time).toString(16).match(/.{1,2}/g))

        for (let i = 0; i < _bytes.length; i++) {
            let __hex = 0;

            if (i === 0) {
                __hex = parseInt(byteTable[parseInt(byteTable[0], 16) - 1], 16)

                byteTable[0] = (__hex).toString(16);
            } else if (i === 1) {
                __hex = parseInt(byteTable[253], 16);
                _hex = 254;

                byteTable[i] = (__hex).toString(16);
            } else {
                let _ = _hex + parseInt(byteTable[i], 16);
                if (_ > 256) _ -= 256;

                __hex = parseInt(byteTable[_ - 1], 16);
                _hex = _;

                byteTable[i] = parseInt(byteTable[_hex - 1], 16).toString(16);
            }

            if ((__hex * 2) > 256) __hex = __hex * 2 - 256;
            else __hex = __hex * 2;

            _bytes[i] = ((parseInt(byteTable[__hex - 1], 16)) ^ (parseInt(_bytes[i], 16))).toString(16);
        }

        for (let i = 0; i < _bytes.length; i++) {
            let byte = _bytes[i];

            if (byte.length < 2)
                byte += "0";
            else byte = byte.split("").reverse().join("");

            if (i < _bytes.length - 1) {
                byte = ((parseInt(byte, 16)) ^ (parseInt(_bytes[i + 1], 16))).toString(16);
            } else byte = ((parseInt(byte, 16)) ^ (parseInt(_bytes[0], 16))).toString(16);

            let _byte = ((((parseInt(byte, 16)) & (parseInt("55", 16))) * 2) | Math.abs((parseInt(byte, 16)) & (parseInt("AA", 16))) / 2);
            _byte = (((_byte & parseInt("33", 16)) * 4) | ((_byte & parseInt("cc", 16)) / 4)).toString(16);

            if (_byte.length > 1)
                _byte = _byte.split("").reverse().join("");
            else _byte += "0";

            _byte = ((parseInt(_byte, 16)) ^ (parseInt("FF", 16))) ^ parseInt("14", 16);
            _bytes[i] = (_byte).toString(16);
        }

        data = data.concat(_bytes);

        for (let i = 0; i < data.length; i++) {
            if (data[i].length > 1)
                str += data[i].toString()
            else {
                str += "0";
                str += data[i].toString()
            }
        }

        return str;
    }

    /**
     * @param {String} parameters 
     * @param {String} cookies
     * @param {String} stub
     * @returns {Object} 
     */
    static getHeaders = (parameters, cookies, stub) => {
        let str = (parameters.length > 0 ? this.md5(parameters) : stub ? this.md5(stub) : EMPTY_STR) + EMPTY_STR + this.md5(cookies) + (cookies.indexOf("sessionid=") !== -1 ? this.md5(cookies.split("sessionid=")[1].split(";")[0]) : EMPTY_STR);

        return this.calculate(this.toByteArr(str), Math.floor(new Date().getTime() / 1000));
    }
}

module.exports = Encryption
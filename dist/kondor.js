/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 820:
/***/ ((module) => {


// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
function base (ALPHABET) {
  if (ALPHABET.length >= 255) { throw new TypeError('Alphabet too long') }
  var BASE_MAP = new Uint8Array(256)
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i)
    var xc = x.charCodeAt(0)
    if (BASE_MAP[xc] !== 255) { throw new TypeError(x + ' is ambiguous') }
    BASE_MAP[xc] = i
  }
  var BASE = ALPHABET.length
  var LEADER = ALPHABET.charAt(0)
  var FACTOR = Math.log(BASE) / Math.log(256) // log(BASE) / log(256), rounded up
  var iFACTOR = Math.log(256) / Math.log(BASE) // log(256) / log(BASE), rounded up
  function encode (source) {
    if (source instanceof Uint8Array) {
    } else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source)
    }
    if (!(source instanceof Uint8Array)) { throw new TypeError('Expected Uint8Array') }
    if (source.length === 0) { return '' }
        // Skip & count leading zeroes.
    var zeroes = 0
    var length = 0
    var pbegin = 0
    var pend = source.length
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++
      zeroes++
    }
        // Allocate enough space in big-endian base58 representation.
    var size = ((pend - pbegin) * iFACTOR + 1) >>> 0
    var b58 = new Uint8Array(size)
        // Process the bytes.
    while (pbegin !== pend) {
      var carry = source[pbegin]
            // Apply "b58 = b58 * 256 + ch".
      var i = 0
      for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
        carry += (256 * b58[it1]) >>> 0
        b58[it1] = (carry % BASE) >>> 0
        carry = (carry / BASE) >>> 0
      }
      if (carry !== 0) { throw new Error('Non-zero carry') }
      length = i
      pbegin++
    }
        // Skip leading zeroes in base58 result.
    var it2 = size - length
    while (it2 !== size && b58[it2] === 0) {
      it2++
    }
        // Translate the result into a string.
    var str = LEADER.repeat(zeroes)
    for (; it2 < size; ++it2) { str += ALPHABET.charAt(b58[it2]) }
    return str
  }
  function decodeUnsafe (source) {
    if (typeof source !== 'string') { throw new TypeError('Expected String') }
    if (source.length === 0) { return new Uint8Array() }
    var psz = 0
        // Skip leading spaces.
    if (source[psz] === ' ') { return }
        // Skip and count leading '1's.
    var zeroes = 0
    var length = 0
    while (source[psz] === LEADER) {
      zeroes++
      psz++
    }
        // Allocate enough space in big-endian base256 representation.
    var size = (((source.length - psz) * FACTOR) + 1) >>> 0 // log(58) / log(256), rounded up.
    var b256 = new Uint8Array(size)
        // Process the characters.
    while (source[psz]) {
            // Decode character
      var carry = BASE_MAP[source.charCodeAt(psz)]
            // Invalid character
      if (carry === 255) { return }
      var i = 0
      for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
        carry += (BASE * b256[it3]) >>> 0
        b256[it3] = (carry % 256) >>> 0
        carry = (carry / 256) >>> 0
      }
      if (carry !== 0) { throw new Error('Non-zero carry') }
      length = i
      psz++
    }
        // Skip trailing spaces.
    if (source[psz] === ' ') { return }
        // Skip leading zeroes in b256.
    var it4 = size - length
    while (it4 !== size && b256[it4] === 0) {
      it4++
    }
    var vch = new Uint8Array(zeroes + (size - it4))
    var j = zeroes
    while (it4 !== size) {
      vch[j++] = b256[it4++]
    }
    return vch
  }
  function decode (string) {
    var buffer = decodeUnsafe(string)
    if (buffer) { return buffer }
    throw new Error('Non-base' + BASE + ' character')
  }
  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  }
}
module.exports = base


/***/ }),

/***/ 556:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const { encodeText } = __webpack_require__(413)

/** @typedef {import('./types').CodecFactory} CodecFactory */
/** @typedef {import("./types").BaseName} BaseName */
/** @typedef {import("./types").BaseCode} BaseCode */

/**
 * Class to encode/decode in the supported Bases
 *
 */
class Base {
  /**
   * @param {BaseName} name
   * @param {BaseCode} code
   * @param {CodecFactory} factory
   * @param {string} alphabet
   */
  constructor (name, code, factory, alphabet) {
    this.name = name
    this.code = code
    this.codeBuf = encodeText(this.code)
    this.alphabet = alphabet
    this.codec = factory(alphabet)
  }

  /**
   * @param {Uint8Array} buf
   * @returns {string}
   */
  encode (buf) {
    return this.codec.encode(buf)
  }

  /**
   * @param {string} string
   * @returns {Uint8Array}
   */
  decode (string) {
    for (const char of string) {
      if (this.alphabet && this.alphabet.indexOf(char) < 0) {
        throw new Error(`invalid character '${char}' in '${string}'`)
      }
    }
    return this.codec.decode(string)
  }
}

module.exports = Base


/***/ }),

/***/ 77:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const baseX = __webpack_require__(820)
const Base = __webpack_require__(556)
const { rfc4648 } = __webpack_require__(727)
const { decodeText, encodeText } = __webpack_require__(413)

/** @typedef {import('./types').CodecFactory} CodecFactory */
/** @typedef {import('./types').Codec} Codec */
/** @typedef {import('./types').BaseName} BaseName */
/** @typedef {import('./types').BaseCode} BaseCode */

/** @type {CodecFactory} */
const identity = () => {
  return {
    encode: decodeText,
    decode: encodeText
  }
}

/**
 *
 * name, code, implementation, alphabet
 *
 * @type {Array<[BaseName, BaseCode, CodecFactory, string]>}
 */
const constants = [
  ['identity', '\x00', identity, ''],
  ['base2', '0', rfc4648(1), '01'],
  ['base8', '7', rfc4648(3), '01234567'],
  ['base10', '9', baseX, '0123456789'],
  ['base16', 'f', rfc4648(4), '0123456789abcdef'],
  ['base16upper', 'F', rfc4648(4), '0123456789ABCDEF'],
  ['base32hex', 'v', rfc4648(5), '0123456789abcdefghijklmnopqrstuv'],
  ['base32hexupper', 'V', rfc4648(5), '0123456789ABCDEFGHIJKLMNOPQRSTUV'],
  ['base32hexpad', 't', rfc4648(5), '0123456789abcdefghijklmnopqrstuv='],
  ['base32hexpadupper', 'T', rfc4648(5), '0123456789ABCDEFGHIJKLMNOPQRSTUV='],
  ['base32', 'b', rfc4648(5), 'abcdefghijklmnopqrstuvwxyz234567'],
  ['base32upper', 'B', rfc4648(5), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'],
  ['base32pad', 'c', rfc4648(5), 'abcdefghijklmnopqrstuvwxyz234567='],
  ['base32padupper', 'C', rfc4648(5), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567='],
  ['base32z', 'h', rfc4648(5), 'ybndrfg8ejkmcpqxot1uwisza345h769'],
  ['base36', 'k', baseX, '0123456789abcdefghijklmnopqrstuvwxyz'],
  ['base36upper', 'K', baseX, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  ['base58btc', 'z', baseX, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'],
  ['base58flickr', 'Z', baseX, '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'],
  ['base64', 'm', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'],
  ['base64pad', 'M', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='],
  ['base64url', 'u', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'],
  ['base64urlpad', 'U', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=']
]

/** @type {Record<BaseName,Base>} */
const names = constants.reduce((prev, tupple) => {
  prev[tupple[0]] = new Base(tupple[0], tupple[1], tupple[2], tupple[3])
  return prev
}, /** @type {Record<BaseName,Base>} */({}))

/** @type {Record<BaseCode,Base>} */
const codes = constants.reduce((prev, tupple) => {
  prev[tupple[1]] = names[tupple[0]]
  return prev
}, /** @type {Record<BaseCode,Base>} */({}))

module.exports = {
  names,
  codes
}


/***/ }),

/***/ 957:
/***/ ((module, exports, __webpack_require__) => {

/**
 * Implementation of the [multibase](https://github.com/multiformats/multibase) specification.
 *
 */


const constants = __webpack_require__(77)
const { encodeText, decodeText, concat } = __webpack_require__(413)

/** @typedef {import('./base')} Base */
/** @typedef {import("./types").BaseNameOrCode} BaseNameOrCode */
/** @typedef {import("./types").BaseCode} BaseCode */
/** @typedef {import("./types").BaseName} BaseName */

/**
 * Create a new Uint8Array with the multibase varint+code.
 *
 * @param {BaseNameOrCode} nameOrCode - The multibase name or code number.
 * @param {Uint8Array} buf - The data to be prefixed with multibase.
 * @returns {Uint8Array}
 * @throws {Error} Will throw if the encoding is not supported
 */
function multibase (nameOrCode, buf) {
  if (!buf) {
    throw new Error('requires an encoded Uint8Array')
  }
  const { name, codeBuf } = encoding(nameOrCode)
  validEncode(name, buf)

  return concat([codeBuf, buf], codeBuf.length + buf.length)
}

/**
 * Encode data with the specified base and add the multibase prefix.
 *
 * @param {BaseNameOrCode} nameOrCode - The multibase name or code number.
 * @param {Uint8Array} buf - The data to be encoded.
 * @returns {Uint8Array}
 * @throws {Error} Will throw if the encoding is not supported
 *
 */
function encode (nameOrCode, buf) {
  const enc = encoding(nameOrCode)
  const data = encodeText(enc.encode(buf))

  return concat([enc.codeBuf, data], enc.codeBuf.length + data.length)
}

/**
 * Takes a Uint8Array or string encoded with multibase header, decodes it and
 * returns the decoded buffer
 *
 * @param {Uint8Array|string} data
 * @returns {Uint8Array}
 * @throws {Error} Will throw if the encoding is not supported
 *
 */
function decode (data) {
  if (data instanceof Uint8Array) {
    data = decodeText(data)
  }
  const prefix = data[0]

  // Make all encodings case-insensitive except the ones that include upper and lower chars in the alphabet
  if (['f', 'F', 'v', 'V', 't', 'T', 'b', 'B', 'c', 'C', 'h', 'k', 'K'].includes(prefix)) {
    data = data.toLowerCase()
  }
  const enc = encoding(/** @type {BaseCode} */(data[0]))
  return enc.decode(data.substring(1))
}

/**
 * Is the given data multibase encoded?
 *
 * @param {Uint8Array|string} data
 */
function isEncoded (data) {
  if (data instanceof Uint8Array) {
    data = decodeText(data)
  }

  // Ensure bufOrString is a string
  if (Object.prototype.toString.call(data) !== '[object String]') {
    return false
  }

  try {
    const enc = encoding(/** @type {BaseCode} */(data[0]))
    return enc.name
  } catch (err) {
    return false
  }
}

/**
 * Validate encoded data
 *
 * @param {BaseNameOrCode} name
 * @param {Uint8Array} buf
 * @returns {void}
 * @throws {Error} Will throw if the encoding is not supported
 */
function validEncode (name, buf) {
  const enc = encoding(name)
  enc.decode(decodeText(buf))
}

/**
 * Get the encoding by name or code
 *
 * @param {BaseNameOrCode} nameOrCode
 * @returns {Base}
 * @throws {Error} Will throw if the encoding is not supported
 */
function encoding (nameOrCode) {
  if (Object.prototype.hasOwnProperty.call(constants.names, /** @type {BaseName} */(nameOrCode))) {
    return constants.names[/** @type {BaseName} */(nameOrCode)]
  } else if (Object.prototype.hasOwnProperty.call(constants.codes, /** @type {BaseCode} */(nameOrCode))) {
    return constants.codes[/** @type {BaseCode} */(nameOrCode)]
  } else {
    throw new Error(`Unsupported encoding: ${nameOrCode}`)
  }
}

/**
 * Get encoding from data
 *
 * @param {string|Uint8Array} data
 * @returns {Base}
 * @throws {Error} Will throw if the encoding is not supported
 */
function encodingFromData (data) {
  if (data instanceof Uint8Array) {
    data = decodeText(data)
  }

  return encoding(/** @type {BaseCode} */(data[0]))
}

exports = module.exports = multibase
exports.encode = encode
exports.decode = decode
exports.isEncoded = isEncoded
exports.encoding = encoding
exports.encodingFromData = encodingFromData
const names = Object.freeze(constants.names)
const codes = Object.freeze(constants.codes)
exports.names = names
exports.codes = codes


/***/ }),

/***/ 727:
/***/ ((module) => {



/** @typedef {import('./types').CodecFactory} CodecFactory */

/**
 * @param {string} string
 * @param {string} alphabet
 * @param {number} bitsPerChar
 * @returns {Uint8Array}
 */
const decode = (string, alphabet, bitsPerChar) => {
  // Build the character lookup table:
  /** @type {Record<string, number>} */
  const codes = {}
  for (let i = 0; i < alphabet.length; ++i) {
    codes[alphabet[i]] = i
  }

  // Count the padding bytes:
  let end = string.length
  while (string[end - 1] === '=') {
    --end
  }

  // Allocate the output:
  const out = new Uint8Array((end * bitsPerChar / 8) | 0)

  // Parse the data:
  let bits = 0 // Number of bits currently in the buffer
  let buffer = 0 // Bits waiting to be written out, MSB first
  let written = 0 // Next byte to write
  for (let i = 0; i < end; ++i) {
    // Read one character from the string:
    const value = codes[string[i]]
    if (value === undefined) {
      throw new SyntaxError('Invalid character ' + string[i])
    }

    // Append the bits to the buffer:
    buffer = (buffer << bitsPerChar) | value
    bits += bitsPerChar

    // Write out some bits if the buffer has a byte's worth:
    if (bits >= 8) {
      bits -= 8
      out[written++] = 0xff & (buffer >> bits)
    }
  }

  // Verify that we have received just enough bits:
  if (bits >= bitsPerChar || 0xff & (buffer << (8 - bits))) {
    throw new SyntaxError('Unexpected end of data')
  }

  return out
}

/**
 * @param {Uint8Array} data
 * @param {string} alphabet
 * @param {number} bitsPerChar
 * @returns {string}
 */
const encode = (data, alphabet, bitsPerChar) => {
  const pad = alphabet[alphabet.length - 1] === '='
  const mask = (1 << bitsPerChar) - 1
  let out = ''

  let bits = 0 // Number of bits currently in the buffer
  let buffer = 0 // Bits waiting to be written out, MSB first
  for (let i = 0; i < data.length; ++i) {
    // Slurp data into the buffer:
    buffer = (buffer << 8) | data[i]
    bits += 8

    // Write out as much as we can:
    while (bits > bitsPerChar) {
      bits -= bitsPerChar
      out += alphabet[mask & (buffer >> bits)]
    }
  }

  // Partial character:
  if (bits) {
    out += alphabet[mask & (buffer << (bitsPerChar - bits))]
  }

  // Add padding characters until we hit a byte boundary:
  if (pad) {
    while ((out.length * bitsPerChar) & 7) {
      out += '='
    }
  }

  return out
}

/**
 * RFC4648 Factory
 *
 * @param {number} bitsPerChar
 * @returns {CodecFactory}
 */
const rfc4648 = (bitsPerChar) => (alphabet) => {
  return {
    /**
     * @param {Uint8Array} input
     * @returns {string}
     */
    encode (input) {
      return encode(input, alphabet, bitsPerChar)
    },
    /**
     * @param {string} input
     * @returns {Uint8Array}
     */
    decode (input) {
      return decode(input, alphabet, bitsPerChar)
    }
  }
}

module.exports = { rfc4648 }


/***/ }),

/***/ 413:
/***/ ((module) => {



const textDecoder = new TextDecoder()
/**
 * @param {ArrayBufferView|ArrayBuffer} bytes
 * @returns {string}
 */
const decodeText = (bytes) => textDecoder.decode(bytes)

const textEncoder = new TextEncoder()
/**
 * @param {string} text
 * @returns {Uint8Array}
 */
const encodeText = (text) => textEncoder.encode(text)

/**
 * Returns a new Uint8Array created by concatenating the passed Arrays
 *
 * @param {Array<ArrayLike<number>>} arrs
 * @param {number} length
 * @returns {Uint8Array}
 */
function concat (arrs, length) {
  const output = new Uint8Array(length)
  let offset = 0

  for (const arr of arrs) {
    output.set(arr, offset)
    offset += arr.length
  }

  return output
}

module.exports = { decodeText, encodeText, concat }


/***/ }),

/***/ 698:
/***/ ((__unused_webpack_module, exports) => {


/* eslint-disable no-undef */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Messenger = void 0;
function getError(e) {
    if (typeof e !== "object")
        return e;
    if (e.message)
        return e.message;
    // console.debug("unknown kondor error");
    // console.debug(e);
    return "unknown kondor error";
}
async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
class Messenger {
    constructor(opts) {
        this.listeners = [];
        this.onExtensionRequest = () => Promise.resolve();
        this.onDomRequest = () => Promise.resolve();
        if (!opts)
            return;
        if (opts.onExtensionRequest) {
            this.onExtensionRequest = opts.onExtensionRequest;
            const listener = async (data, sender, res) => {
                res();
                const { id, command } = data;
                // check if it is a MessageRequest
                if (!command)
                    return;
                const message = { id };
                // console.debug("incoming request", id, ":", command);
                // console.debug((data as MessageRequest).args);
                try {
                    const result = await this.onExtensionRequest(data, id, sender);
                    // check if other process will send the response
                    if (typeof result === "object" &&
                        result !== null &&
                        result._derived) {
                        // console.debug("response", id, "derived");
                        return;
                    }
                    message.result = result;
                }
                catch (error) {
                    message.error = error.message;
                }
                if (typeof message.result === "undefined" && !message.error)
                    return;
                this.sendResponse("extension", message, sender);
            };
            this.listeners.push({ type: "extension", id: "onRequest", listener });
            chrome.runtime.onMessage.addListener(listener);
        }
        if (opts.onDomRequest) {
            this.onDomRequest = opts.onDomRequest;
            const listener = async (event) => {
                const { id, command } = event.data;
                // check if it is a MessageRequest
                if (!command)
                    return;
                const message = { id };
                // console.debug("incoming request", id, ":", command);
                // console.debug((event.data as MessageRequest).args);
                try {
                    const result = await this.onDomRequest(event, id);
                    // check if other process will send the response
                    if (typeof result === "object" &&
                        result !== null &&
                        result._derived) {
                        // console.debug("response", id, "derived");
                        return;
                    }
                    message.result = result;
                }
                catch (error) {
                    message.error = error.message;
                }
                if (typeof message.result === "undefined" && !message.error)
                    return;
                this.sendResponse("dom", message);
            };
            this.listeners.push({ type: "dom", id: "onRequest", listener });
            window.addEventListener("message", listener);
        }
    }
    sendResponse(type, message, sender) {
        // console.debug("outgoing response", message.id, ":");
        // console.debug(message);
        if (type === "dom")
            window.postMessage(message, "*");
        else {
            if (sender && sender.tab)
                chrome.tabs.sendMessage(sender.tab.id, message);
            else
                chrome.runtime.sendMessage(message);
        }
    }
    async sendDomMessage(to, command, args) {
        const reqId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            // prepare the listener
            const listener = (event) => {
                // ignore requests
                if (event.data.command)
                    return;
                const { id, result, error } = event.data;
                // ignore different ids
                if (id !== reqId)
                    return;
                // send response
                if (error) {
                    // console.debug("error received", id, ":");
                    // console.debug(getError(error));
                    reject(new Error(getError(error)));
                }
                else {
                    // console.debug("response received", id, ":");
                    // console.debug(result);
                    resolve(result);
                }
                this.removeListener(reqId);
            };
            // listen
            this.listeners.push({ type: "dom", id: reqId, listener });
            window.addEventListener("message", listener);
            // send request
            window.postMessage({
                id: reqId,
                command,
                args: args ? JSON.parse(JSON.stringify(args)) : args,
                to,
            }, "*");
            // console.debug("sending message", reqId, command, "to dom");
            // console.debug(args);
        });
    }
    async sendExtensionMessage(to, command, args, opts) {
        const reqId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            // prepare the listener
            const listener = (data, _sender, res) => {
                res();
                // ignore requests
                if (data.command)
                    return;
                const { id, result, error } = data;
                // ignore different ids
                if (id !== reqId)
                    return;
                // send response
                if (error) {
                    // console.debug("error received", id, ":");
                    // console.debug(getError(error));
                    reject(new Error(getError(error)));
                }
                else {
                    // console.debug("response received", id, ":");
                    // console.debug(result);
                    resolve(result);
                }
                this.removeListener(reqId);
            };
            // listen
            this.listeners.push({ type: "extension", id: reqId, listener });
            chrome.runtime.onMessage.addListener(listener);
            // send request
            const sendMessage = () => {
                if (["popup", "background"].includes(to)) {
                    chrome.runtime.sendMessage({
                        id: reqId,
                        command,
                        args: args ? JSON.parse(JSON.stringify(args)) : args,
                        to,
                    });
                }
                else {
                    // 'to' is tab.id
                    chrome.tabs.sendMessage(to, {
                        id: reqId,
                        command,
                        args: args ? JSON.parse(JSON.stringify(args)) : args,
                        to,
                    });
                }
                // console.debug("sending message", reqId, command, "to", to);
                // console.debug(args);
            };
            sendMessage();
            // define timeout
            if (opts && opts.timeout) {
                setTimeout(() => {
                    reject(new Error("Connection lost"));
                    this.removeListener(reqId);
                }, opts.timeout);
            }
            // ping
            if (opts && opts.ping) {
                (async () => {
                    let retries = (opts === null || opts === void 0 ? void 0 : opts.retries) || 0;
                    await sleep(1000);
                    while (this.listeners.find((l) => l.id === reqId)) {
                        try {
                            await this.sendExtensionMessage(to, "ping", { id: reqId, to }, { timeout: (opts === null || opts === void 0 ? void 0 : opts.pingTimeout) || 80 });
                            await sleep(1000);
                        }
                        catch (error) {
                            if (retries <= 0) {
                                reject(error);
                                this.removeListener(reqId);
                                break;
                            }
                            retries -= 1;
                            console.log(`retrying ${reqId}. remaining retries: ${retries}`);
                            sendMessage();
                            await sleep(100);
                        }
                    }
                })()
                    .then(() => { })
                    .catch((e) => {
                    console.log("ping error:");
                    console.log(e);
                });
            }
        });
    }
    removeListener(id) {
        const index = this.listeners.findIndex((l) => l.id === id);
        if (index < 0)
            return;
        const removed = this.listeners.splice(index, 1);
        const { listener, type } = removed[0];
        if (type === "dom") {
            window.removeEventListener("message", listener);
        }
        else {
            chrome.runtime.onMessage.removeListener(listener);
        }
    }
    removeListeners() {
        this.listeners.forEach((l) => {
            const { type, listener } = l;
            if (type === "dom") {
                window.removeEventListener("message", listener);
            }
            else {
                chrome.runtime.onMessage.removeListener(listener);
            }
        });
        this.listeners = [];
    }
}
exports["default"] = Messenger;
exports.Messenger = Messenger;


/***/ }),

/***/ 339:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getAccounts = void 0;
const Messenger_1 = __webpack_require__(698);
const constants_1 = __webpack_require__(601);
const messenger = new Messenger_1.Messenger();
async function getAccounts() {
    return messenger.sendDomMessage("popup", "getAccounts", { kondorVersion: constants_1.kondorVersion });
}
exports.getAccounts = getAccounts;
exports["default"] = getAccounts;


/***/ }),

/***/ 601:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.kondorVersion = void 0;
const packageJson = __importStar(__webpack_require__(147));
exports.kondorVersion = packageJson.version;


/***/ }),

/***/ 599:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.provider = exports.getProvider = void 0;
const Messenger_1 = __webpack_require__(698);
const constants_1 = __webpack_require__(601);
const messenger = new Messenger_1.Messenger({});
function getProvider(network) {
    return {
        rpcNodes: [],
        onError: () => true,
        currentNodeId: 0,
        async call(method, params) {
            return messenger.sendDomMessage("background", "provider:call", {
                network,
                method,
                params,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getNonce(account) {
            return messenger.sendDomMessage("background", "provider:getNonce", {
                network,
                account,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getNextNonce(account) {
            return messenger.sendDomMessage("background", "provider:getNextNonce", {
                network,
                account,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getAccountRc(account) {
            return messenger.sendDomMessage("background", "provider:getAccountRc", {
                network,
                account,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getTransactionsById(transactionIds) {
            return messenger.sendDomMessage("background", "provider:getTransactionsById", {
                network,
                transactionIds,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getBlocksById(blockIds, opts) {
            return messenger.sendDomMessage("background", "provider:getBlocksById", {
                network,
                blockIds,
                opts,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getHeadInfo() {
            return messenger.sendDomMessage("background", "provider:getHeadInfo", {
                network,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getChainId() {
            return messenger.sendDomMessage("background", "provider:getChainId", {
                network,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getBlocks(height, numBlocks, idRef, opts) {
            return messenger.sendDomMessage("background", "provider:getBlocks", {
                network,
                height,
                numBlocks,
                idRef,
                opts,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        getBlock(height, opts) {
            return messenger.sendDomMessage("background", "provider:getBlock", {
                network,
                height,
                opts,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async wait(txId, type, timeout) {
            return messenger.sendDomMessage("background", "provider:wait", {
                network,
                txId,
                type,
                timeout,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async sendTransaction(transaction, broadcast) {
            const response = await messenger.sendDomMessage("background", "provider:sendTransaction", {
                network,
                transaction,
                broadcast,
                kondorVersion: constants_1.kondorVersion,
            });
            transaction.id = response.transaction.id;
            transaction.header = response.transaction.header;
            transaction.operations = response.transaction.operations;
            transaction.signatures = response.transaction.signatures;
            transaction.wait = async (type = "byBlock", timeout = 60000) => {
                return messenger.sendDomMessage("background", "provider:wait", {
                    network,
                    txId: transaction.id,
                    type,
                    timeout,
                    kondorVersion: constants_1.kondorVersion,
                });
            };
            return {
                transaction: transaction,
                receipt: response.receipt,
            };
        },
        async submitBlock(block) {
            return messenger.sendDomMessage("background", "provider:submitBlock", {
                network,
                block,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async readContract(operation) {
            return messenger.sendDomMessage("background", "provider:readContract", {
                network,
                operation,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getForkHeads() {
            return messenger.sendDomMessage("background", "provider:getForkHeads", {
                network,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async getResourceLimits() {
            return messenger.sendDomMessage("background", "provider:getResourceLimits", {
                network,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async invokeSystemCall(serializer, nameOrId, args, callerData) {
            return messenger.sendDomMessage("background", "provider:invokeSystemCall", {
                network,
                serializer,
                nameOrId,
                args,
                callerData,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        async invokeGetContractMetadata(contractId) {
            return messenger.sendDomMessage("background", "provider:getResourceLimits", {
                network,
                contractId,
                kondorVersion: constants_1.kondorVersion,
            });
        },
    };
}
exports.getProvider = getProvider;
exports.provider = getProvider();
exports["default"] = exports.provider;


/***/ }),

/***/ 942:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSigner = void 0;
const Messenger_1 = __webpack_require__(698);
const constants_1 = __webpack_require__(601);
const utils_1 = __webpack_require__(593);
const messenger = new Messenger_1.Messenger({});
function getSigner(signerAddress, options) {
    if (!signerAddress)
        throw new Error("no signerAddress defined");
    return {
        getAddress: () => signerAddress,
        signHash: (hash) => {
            return messenger.sendDomMessage("popup", "signer:signHash", {
                signerAddress,
                hash,
                kondorVersion: constants_1.kondorVersion,
            });
        },
        signMessage: async (message) => {
            const signatureBase64url = await messenger.sendDomMessage("popup", "signer:signMessage", {
                signerAddress,
                message,
                kondorVersion: constants_1.kondorVersion,
            });
            return (0, utils_1.decodeBase64url)(signatureBase64url);
        },
        signTransaction: async (transaction, abis) => {
            const tx = await messenger.sendDomMessage("popup", "signer:signTransaction", {
                signerAddress,
                transaction,
                abis,
                kondorVersion: constants_1.kondorVersion,
            });
            transaction.id = tx.id;
            transaction.header = tx.header;
            transaction.operations = tx.operations;
            transaction.signatures = tx.signatures;
            return transaction;
        },
        sendTransaction: async (transaction, optsSend) => {
            if (optsSend === null || optsSend === void 0 ? void 0 : optsSend.beforeSend) {
                throw new Error("beforeSend option is not supported in kondor");
            }
            const response = await messenger.sendDomMessage("popup", "signer:sendTransaction", {
                signerAddress,
                transaction,
                optsSend,
                kondorVersion: constants_1.kondorVersion,
            });
            transaction.id = response.transaction.id;
            transaction.header = response.transaction.header;
            transaction.operations = response.transaction.operations;
            transaction.signatures = response.transaction.signatures;
            transaction.wait = async (type = "byBlock", timeout = 60000) => {
                return messenger.sendDomMessage("background", "provider:wait", {
                    network: options ? options.network : "",
                    txId: transaction.id,
                    type,
                    timeout,
                    kondorVersion: constants_1.kondorVersion,
                });
            };
            return {
                transaction: transaction,
                receipt: response.receipt,
            };
        },
        prepareBlock: () => {
            throw new Error("prepareBlock is not available");
        },
        signBlock: () => {
            throw new Error("signBlock is not available");
        },
    };
}
exports.getSigner = getSigner;
exports["default"] = getSigner;


/***/ }),

/***/ 593:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeBase64url = void 0;
const multibase = __importStar(__webpack_require__(957));
/**
 * Decodes a buffer formatted in base64url
 */
function decodeBase64url(bs64url) {
    return multibase.decode(`U${bs64url}`);
}
exports.decodeBase64url = decodeBase64url;


/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = JSON.parse('{"name":"kondor-js","version":"1.1.0","description":"Kondor Library","author":"Julian Gonzalez","repository":{"url":"https://github.com/joticajulian/kondor-js.git"},"homepage":"https://github.com/joticajulian/kondor-js.git","bugs":{"url":"https://github.com/joticajulian/kondor-js/issues"},"files":["lib","dist","src"],"main":"./lib/browser/src/index.js","types":"./lib/browser/src/index.d.ts","browser":"./lib/browser/src/index.js","scripts":{"build":"rimraf lib/browser && tsc -p tsconfig.browser.json","bundle":"yarn bundle:no-min && yarn bundle:min && yarn testfiles","bundle:min":"webpack --mode=production --config webpack.prod.config.js","bundle:no-min":"webpack --mode=production --config webpack.dev.config.js","lint":"yarn lint:prettier && yarn lint:eslint && yarn lint:tsc","lint:prettier":"prettier . --check","lint:eslint":"eslint . --ext .js,.ts","lint:tsc":"tsc --noEmit --incremental false","prerelease":"yarn bundle && yarn build","serve":"node test/server.js","testfiles":"copyfiles -u 3 node_modules/koilib/dist/koinos.min.js test/js && copyfiles -u 1 dist/kondor.min.js test/js"},"exports":{"./package.json":"./package.json",".":"./lib/browser/src/index.js"},"dependencies":{"multibase":"^4.0.6"},"devDependencies":{"@tsconfig/node12":"^1.0.11","@types/chrome":"^0.0.195","@typescript-eslint/eslint-plugin":"^5.35.1","@typescript-eslint/parser":"^5.35.1","copyfiles":"^2.4.1","eslint":"^8.22.0","eslint-config-airbnb-typescript":"^17.0.0","eslint-config-prettier":"^8.3.0","eslint-plugin-import":"^2.25.4","eslint-plugin-prettier":"^4.2.1","eslint-plugin-tsdoc":"^0.2.16","fastify":"^3.26.0","fastify-static":"^4.5.0","koilib":"^7.0.0","prettier":"^2.7.1","rimraf":"^3.0.2","ts-loader":"~8.2.0","typescript":"4.5.4","webpack":"^5.88.2","webpack-cli":"^5.1.4"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

/*! kondor - MIT License (c) Julian Gonzalez (joticajulian@gmail.com) */
__webpack_unused_export__ = ({ value: true });
const provider_1 = __webpack_require__(599);
const signer_1 = __webpack_require__(942);
const account_1 = __webpack_require__(339);
window.kondor = { provider: provider_1.provider, getProvider: provider_1.getProvider, getSigner: signer_1.getSigner, getAccounts: account_1.getAccounts };

})();

/******/ })()
;
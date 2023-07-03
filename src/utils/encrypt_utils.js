const crypto = require('crypto');

/**
 * Encrypts a message using the AES-256-CBC algorithm and the specified parameters.
 *
 * @param {Object} params - The encryption parameters.
 * @param {string} params.message - The message to be encrypted.
 * @param {string} params.key - The encryption key.
 * @returns {string} The encrypted message in the format: IV:encryptedMessage.
 * @throws {Error} Throws an error if the encryption key is not 32 bytes long.
 */
function plainEncrypt(params) {
    const algorithm = 'aes-256-cbc';
    let encryptionKey = crypto.createHash('sha256').update(String(params.key)).digest();

    let iv = crypto.randomBytes(16); // Set IV length to 16 bytes for AES-256-CBC

    let cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

    let encrypted = cipher.update(params.message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Converts a string to binary representation.
 *
 * @param {string} str - The string to be converted.
 * @returns {string} The binary representation of the string.
 */
function stringToBinary(str) {
    const buffer = Buffer.from(str, 'utf8');
    let binary = '';

    for (const byte of buffer) {
        binary += byte.toString(2).padStart(8, '0');
    }
    return binary;
};

module.exports = {
    plainEncrypt,
    stringToBinary,
}
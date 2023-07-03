const crypto = require('crypto');

/**
 * Decrypts an encrypted message using the AES-256-CBC algorithm and the specified parameters.
 *
 * @param {Object} params - The decryption parameters.
 * @param {string} params.encryptedData - The encrypted message in the format: IV:encryptedMessage.
 * @param {string} params.key - The decryption key.
 * @returns {string} The decrypted message.
 * @throws {Error} Throws an error if the encryption key is not 32 bytes long.
 */
function plainDecrypt(params) {
    const algorithm = 'aes-256-cbc';
    let encryptionKey = crypto.createHash('sha256').update(String(params.key)).digest();

    if (encryptionKey.length !== 32) {
        throw new Error('Encryption key must be 32 bytes long.');
    }

    let [ivHex, encryptedHex] = params.encryptedData.split(':');
    let iv = Buffer.from(ivHex, 'hex');
    let encrypted = Buffer.from(encryptedHex, 'hex');

    let decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


/***
 * @param {string} binary - binary string to convert back to integer string (10001001, 01101101, etc.)
*/
const binaryToString = (binary) => {
    // Ensure the binary string length is a multiple of 8
    const paddedBinary = binary.padStart(Math.ceil(binary.length / 8) * 8, '0');

    const bytes = [];
    for (let i = 0; i < paddedBinary.length; i += 8) {
        const byte = paddedBinary.slice(i, i + 8);
        bytes.push(parseInt(byte, 2));
    }

    const buffer = Buffer.from(bytes);
    return buffer.toString('utf8');
};


module.exports = {
    binaryToString,
    plainDecrypt,
}
const sharp = require('sharp');
const crypto = require('crypto');

/**
 * Decrypts a message from an input image file using the specified options.
 *
 * @param {Object} options - The decryption options.
 * @param {string} options.input - The path to the input image file.
 * @param {string} options.key - The decryption key.
 * @returns {Promise<void>} A Promise that resolves to the decrypted message as a string.
 */

function decryptMessage(options) {
    // Path to the input image file
    const inputImagePath = options.input;
    sharp(inputImagePath)
        .ensureAlpha() // Ensure the image has an alpha channel for transparency
        .raw() // Retrieve raw pixel data
        .toBuffer({ resolveWithObject: true }) // Resolve with both buffer and metadata
        .then(({ data, info }) => {
            // Get image dimensions
            const { width, height } = info;
            let totalPixels = width * height;

            let currIndex = 1;
            let currX = 1;
            let currY = 0;

            let spacingIndexStr = '';

            do {
                const index = (currY * width + currX) * 4;
                const prevIndex = currX - 1 >= 0 ? (currY * width + (currX - 1)) * 4 : ((currY - 1) * width + (width - 1)) * 4
                // End of spacing encoding
                if (data[index] === data[prevIndex]) {
                    break;
                }

                spacingIndexStr += ((parseInt(data[index]) - parseInt(data[prevIndex])) % 2) // while encrypting, we added 2 for 0 and 1 for 1. So, % will use it to set it directly

                currX += 2
                currIndex += 2;
                if (currIndex % width == 0) {
                    currX = 0;
                    currY++
                }
            } while (true)

            const spacing = parseInt(spacingIndexStr, 2);

            currX += 2
            currIndex += 2;
            if (currIndex % width == 0) {
                currX = 0;
                currY++
            }
            let binStr = ''
            do {
                const index = (currY * width + currX) * 4;
                const prevIndex = currX - 1 >= 0 ? (currY * width + (currX - 1)) * 4 : ((currY - 1) * width + (width - 1)) * 4
                // End of encoded encrypted data
                if (data[index] === data[prevIndex]) {
                    break;
                }
                currIndex++
                if (currIndex % spacing == 0) {

                    binStr += (data[index] - data[prevIndex]) % 2
                    currX++
                }
                if (currIndex % width == 0) {
                    currX = 0;
                    currY++
                }
            } while (currIndex < totalPixels)

            // const encryptedText = binaryToString(binStr);
            options.encryptedData=binaryToString(binStr);

            console.log(plainDecrypt(options))
        });
}

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
    decryptMessage,
}
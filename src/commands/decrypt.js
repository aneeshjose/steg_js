const sharp = require('sharp');
const utils = require('../utils/decrypt_utils.js')
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
            let totalPixels = width * height * 4;

            let currIndex = 1;

            let spacingIndexStr = '';

            do {
                const prevIndex = currIndex - 1;
                // End of spacing encoding
                if (data[currIndex] === data[prevIndex]) {
                    break;
                }
                spacingIndexStr += Math.abs((parseInt(data[currIndex]) - parseInt(data[prevIndex])) % 2) // while encrypting, we added 2 for 0 and 1 for 1. So, % will use it to set it directly
                currIndex += 2;
            } while (true)

            const spacing = parseInt(spacingIndexStr, 2);

            currIndex += 2;
            let binStr = '';

            do {
                const prevIndex = currIndex - 1;
                // End of encoded encrypted data
                if (data[currIndex] === data[prevIndex]) {
                    break;
                }
                binStr += Math.abs(data[currIndex] - data[prevIndex]) % 2
                currIndex += spacing;
            } while (currIndex < totalPixels);

            options.encryptedData = utils.binaryToString(binStr);

            return utils.plainDecrypt(options);
        }).then((decrypted) => {
            console.log(decrypted);
            return { err: false, msg: decrypted };
        }).catch((err) => {
            console.log(err);
            return { err: true, msg: err };
        });
}


module.exports = {
    decryptMessage,
}
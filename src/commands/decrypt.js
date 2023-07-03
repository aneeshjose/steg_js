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
            options.encryptedData = utils.binaryToString(binStr);

            console.log(utils.plainDecrypt(options))
        });
}


module.exports = {
    decryptMessage,
}
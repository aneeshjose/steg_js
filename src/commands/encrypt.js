const sharp = require('sharp');
const utils = require('../utils/encrypt_utils.js');

/**
 * Encrypts a message using key and store it in input image file using the specified options.
 *
 * @param {Object} options - The encryption options.
 * @param {string} options.message - The secret message to be encrypted.
 * @param {string} options.input - The path to the input image file.
 * @param {string} [options.output] - The optional path to the output image file.
 * @param {string} options.key - The encryption key.
 * @returns {Promise<void>} A Promise that resolves to the encrypted message as a string.
 */
function encryptMessage(options) {
    // Path to the input image file
    const inputImagePath = options.input;

    // Path to the output image file
    let outputImagePath = options.output;

    // Open the input image file
    sharp(inputImagePath)
        .ensureAlpha() // Ensure the image has an alpha channel for transparency
        .raw() // Retrieve raw pixel data
        .toBuffer({ resolveWithObject: true }) // Resolve with both buffer and metadata
        .then(({ data, info }) => {
            // Get image dimensions
            const { width, height } = info;
            let totalPixels = width * height;

            if ((options.message ?? '').length == 0) {
                throw "message cannot be empty";
            }
            let encryptedData = utils.plainEncrypt(options);
            let binaryStr = utils.stringToBinary(encryptedData);
            let spacing = parseInt(totalPixels / binaryStr.length);
            let spacingBin = spacing.toString(2);
            let newSpacing = parseInt(totalPixels / (binaryStr.length + spacingBin.length + 2))

            // sometimes, after adding the spacing 0s and 1s the remaining pixels become insufficient for the encoded encryption.
            // so iterate the spaceing till it become same
            while (newSpacing != spacing) {
                spacing = newSpacing;
                spacingBin = spacing.toString(2);
                newSpacing = parseInt(totalPixels / (binaryStr.length + spacingBin.length + 2))
            }

            if (parseInt(spacing) <= 2) {
                throw "Image size invalid";
            }

            let currIndex = 1;
            let currX = 1;
            let currY = 0;

            // add the encoded 0s and 1s for spacing
            let spacingBinIndex = 0;
            do {
                if (spacingBinIndex >= spacingBin.length) {
                    break;
                }

                let newAdd = parseInt(spacingBin[spacingBinIndex])
                const index = (currY * width + currX) * 4;
                // const actualData = data[index];
                const prevIndex = currX - 1 >= 0 ? (currY * width + (currX - 1)) * 4 : ((currY - 1) * width + (width - 1)) * 4
                const diff = newAdd === 1 ? 1 : 2;
                data[index] = (data[prevIndex] + diff); // add 2 instead of 0 to data[index-1]


                spacingBinIndex++
                currX += 2
                currIndex += 2;
                if (currIndex % width == 0) {
                    currX = 0;
                    currY++
                }
            } while (true)

            // to set the ending of the spacing(kind of a delimiter)
            const lastSpacingIndex = (currY * width + currX) * 4;
            const prevIndex = currX - 1 >= 0 ? (currY * width + (currX - 1)) * 4 : ((currY - 1) * width + (width - 1)) * 4
            data[lastSpacingIndex] = data[prevIndex]

            // increment the x, y, and index values for the delimiter
            currX += 2
            currIndex += 2;
            if (currIndex % width == 0) {
                currX = 0;
                currY++
            }

            // add the encoded 0s and 1s of the encrypted message to the previousIndex's value
            let binIndex = 0;
            do {
                currIndex++
                if (currIndex % spacing == 0) {
                    let newAdd = parseInt(binaryStr[binIndex])
                    const index = (currY * width + currX) * 4;
                    const prevIndex = currX - 1 >= 0 ? (currY * width + (currX - 1)) * 4 : ((currY - 1) * width + (width - 1)) * 4
                    const diff = newAdd === 1 ? 1 : 2;
                    data[index] = (data[prevIndex] + diff)
                    binIndex++
                    currX++
                }
                if (currIndex % width == 0) {
                    currX = 0;
                    currY++
                }
            } while (currIndex < totalPixels && binIndex < binaryStr.length)

            // at the end there is a chance of totalPixels-currectIndex>0
            // it leads  to the decryptor to append zeros to the end. Inorder to hinder that, we are adding the EOF(kind of).
            if (totalPixels - currIndex > 0) {
                const lastSpacingIndex = (currY * width + currX) * 4;
                const prevIndex = currX - 1 >= 0 ? (currY * width + (currX - 1)) * 4 : ((currY - 1) * width + (width - 1)) * 4;
                data[lastSpacingIndex] = data[prevIndex];
            }
            // Create a new Sharp instance with the modified pixel data
            const modifiedImage = sharp(data, { raw: { width, height, channels: 4 } });
            // Save the modified image to the output file

            if (!outputImagePath){
                outputImagePath = './output.png';
            }

            return modifiedImage.toFile(outputImagePath);
        })
        .then(() => {
            console.log('Image processing completed!');
        })
        .catch((error) => {
            console.error('An error occurred:', error);
        });
}



module.exports = {
    encryptMessage,
}
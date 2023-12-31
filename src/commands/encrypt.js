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
            let totalIndexes = width * height * 4;

            if ((options.message ?? '').length == 0) {
                throw { err: true, msg: "message cannot be empty" };
            }
            let encryptedData = utils.plainEncrypt(options);
            let binaryStr = utils.stringToBinary(encryptedData);
            let spacing = parseInt(totalIndexes / binaryStr.length);
            let spacingBin = spacing.toString(2);
            let newSpacing = parseInt(totalIndexes / (binaryStr.length + spacingBin.length + 2))

            // sometimes, after adding the spacing 0s and 1s the remaining pixels become insufficient for the encoded encryption.
            // so iterate the spaceing till it become same
            while (newSpacing != spacing) {
                spacing = newSpacing;
                spacingBin = spacing.toString(2);
                newSpacing = parseInt(totalIndexes / (binaryStr.length + spacingBin.length + 2));
            }

            if (parseInt(spacing) <= 2) {
                throw { err: true, msg: "Image size invalid" };
            }

            let currIndex = 1;

            // add the encoded 0s and 1s for spacing
            let spacingBinIndex = 0;
            do {
                if (spacingBinIndex >= spacingBin.length) {
                    break;
                }

                let newAdd = parseInt(spacingBin[spacingBinIndex]);
                const prevIndex = currIndex - 1;
                const diff = newAdd === 1 ? 1 : 2; // add 2 instead of 0 to data[index-1]
                data[currIndex] = (data[prevIndex] + diff);
                if (data[currIndex] > 250) data[currIndex] = (data[prevIndex] - diff);

                spacingBinIndex++;
                currIndex += 2;
            } while (true)

            // to set the ending of the spacing(kind of a delimiter)
            const prevIndex = currIndex - 1;
            data[currIndex] = data[prevIndex];

            // increment the x, y, and index values for the delimiter
            currIndex += 2;

            // add the encoded 0s and 1s of the encrypted message to the previousIndex's value
            let binIndex = 0;
            do {
                let newAdd = parseInt(binaryStr[binIndex]);
                const diff = newAdd === 1 ? 1 : 2;

                const prevIndex = currIndex - 1;
                data[currIndex] = (data[prevIndex] + diff);
                if (data[currIndex] > 250) data[currIndex] = (data[prevIndex] - diff);
                binIndex++;
                currIndex += spacing;
            } while (currIndex < totalIndexes && binIndex < binaryStr.length);

            // at the end there is a chance of totalIndexes-currectIndex>0
            // it leads  to the decryptor to append zeros to the end. Inorder to hinder that, we are adding the EOF(kind of).
            if (totalIndexes - currIndex > 0) {
                data[currIndex] = data[currIndex - 1];
            }
            // Create a new Sharp instance with the modified pixel data
            const modifiedImage = sharp(data, { raw: { width, height, channels: 4 } });
            // Save the modified image to the output file

            if (!outputImagePath) {
                outputImagePath = './output.png';
            }

            return modifiedImage.toFile(outputImagePath);
        })
        .then(() => {
            console.log('Message encryption completed!');
            return { err: false, msg: 'Message encryption completed' };
        })
        .catch((error) => {
            console.error('An error occurred:', error);
            return { err: true, msg: error };
        });
}



module.exports = {
    encryptMessage,
}
// const { encryptMessage } = require('./src/commands/encrypt.js');
// const { decryptMessage } = require('./src/commands/decrypt.js');

const sharp = require('sharp');


createImage({height:3, width:529*3})


/**
 * Create an image of the given height and width
 *
 * @param {Object} dimensions - The image dimensions.
 * @param {string} dimensions.height - The height of the image.
 * @param {string} dimensions.width - The width of the image.
 * @returns {Promise<string>} - The path to the input image.
 */
function createImage(dimensions) {
    let { height, width } = dimensions;
    sharp({
        create: {
            width: width,
            height: height,
            channels: 3, // 3 channels for RGB color (red, green, blue)
            background: { r: 255, g: 0, b: 0 } // Set the background color to red (255, 0, 0)
        }
    }).toFile(`temp/x${dimensions.height}_y${dimensions.width}.jpg`, (err, _) => {
        if (err) {
            console.error(err);
        }
    });
}
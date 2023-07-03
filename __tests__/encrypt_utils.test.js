const { plainEncrypt, stringToBinary } = require('../src/utils/encrypt_utils.js');

describe('plainEncrypt', () => {
    it('should encrypt a message using AES-256-CBC algorithm', () => {
        const params = {
            message: 'Hello, World!',
            key: 'myEncryptionKey1234567890abcdefgh'
        };

        const encryptedMessage = plainEncrypt(params);

        expect(encryptedMessage).toMatch(/^[0-9a-f]{32}:[0-9a-f]{32}$/); // Check if the encrypted message has the correct format
    });

    it('should encrypt a message using AES-256-CBC algorithm even if no password is being passed', () => {
        const params = {
            message: 'Hello, World!',
            key: undefined
        };

        const encryptedMessage = plainEncrypt(params);

        expect(encryptedMessage).toMatch(/^[0-9a-f]{32}:[0-9a-f]{32}$/); // Check if the encrypted message has the correct format
    });

    it('should encrypt a message using AES-256-CBC algorithm even if empty string password is being passed', () => {
        const params = {
            message: 'Hello, World!',
            key: ''
        };

        const encryptedMessage = plainEncrypt(params);

        expect(encryptedMessage).toMatch(/^[0-9a-f]{32}:[0-9a-f]{32}$/); // Check if the encrypted message has the correct format
    });
});

describe('stringToBinary', () => {
    it('should convert a string to binary representation', () => {
        const str = 'Hello, World!';
        const expectedBinary = '01001000011001010110110001101100011011110010110000100000010101110110111101110010011011000110010000100001';

        const binary = stringToBinary(str);

        expect(binary).toBe(expectedBinary);
    });

    it('should convert an empty string to an empty binary representation', () => {
        const str = '';
        const expectedBinary = '';

        const binary = stringToBinary(str);

        expect(binary).toBe(expectedBinary);
    });

    it('should convert string "a" to a corresponding binary representation', () => {
        const str = 'a';
        const expectedBinary = '01100001';

        const binary = stringToBinary(str);

        expect(binary).toBe(expectedBinary);
    });
});
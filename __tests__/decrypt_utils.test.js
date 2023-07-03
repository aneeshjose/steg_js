const { binaryToString, plainDecrypt } = require('../src/utils/decrypt_utils.js');

describe('binaryToString', () => {
    it('should convert a binary string to the corresponding integer string', () => {
        const binary1 = '010000010100001001000011';
        const expected1 = 'ABC';
        const result1 = binaryToString(binary1);
        expect(result1).toBe(expected1);

        const binary2 = '0110100001100101011011000110110001101111';
        const expected2 = 'hello';
        const result2 = binaryToString(binary2);
        expect(result2).toBe(expected2);
    });

    it('should handle binary strings with lengths not divisible by 8', () => {
        const binary3 = '00100001';
        const expected3 = '!';
        const result3 = binaryToString(binary3);
        expect(result3).toBe(expected3);
    });

    it('should handle empty binary strings', () => {
        const binary4 = '';
        const expected4 = '';
        const result4 = binaryToString(binary4);
        expect(result4).toBe(expected4);
    });
});


describe('plainDecrypt', () => {
    const validParams = {
        encryptedData: '3d41f823ccc240e6b613df4081331f75:9a8de9de02dfb5630361afe18a726de8',
        key: 'MySecretKey1234567890!@#$%',
    };

    it('should decrypt an encrypted message using the AES-256-CBC algorithm', () => {
        const expected = 'Hello, World!';
        const result = plainDecrypt(validParams);
        expect(result).toBe(expected);
    });
});


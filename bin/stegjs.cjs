#!/usr/bin/env node

const { program } = require('commander');
const encrypt = require('../src/encrypt.js');
const decrypt = require('../src/decrypt.js');

program
  .version('1.0.0')
  .description('A steganography tool to encrypt text and store it in images');

program
  .command('encrypt')
  .description('encrypt and store text in image')
  .option('-i, --input <inputFilePath>', 'The input image path')
  .option('-o, --output <outputFilePath>', 'The coutput image path')
  .option('-m, --message <message>', 'The secret message to add to the image')
  .option('-k, --key <key>', 'The encryption key')
  .action(encrypt.encryptMessage);

program
  .command('decrypt')
  .description('decrypt and store text in image')
  .option('-i, --input <inputFilePath>', 'The encrypted image path')
  .option('-k, --key <key>', 'The decryption key')
  .action(decrypt.decryptMessage);

program.parse(process.argv);

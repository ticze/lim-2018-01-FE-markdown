#!/usr/bin/env node

const [,, ...args] = process.argv;
const mdLinks = require('./index');
const path = require('path');
const route = path.resolve(args[0]);
const program = require('commander');

const highOrderMdLinks = (route, options) => {
  mdLinks(route, options)
    .then(respuesta => console.log(respuesta))
}

program
  .version('0.1.0')
  .arguments('<path>')
  .option('-v, --validate')
  .option('-s, --stats')
  .action(highOrderMdLinks)
program.parse(process.argv); 
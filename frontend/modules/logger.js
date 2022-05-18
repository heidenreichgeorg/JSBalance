import chalk from 'chalk';

var title = 'default';

function time() {
    return new Date().toLocaleString();
}

function construct(msg) {
    return `[${time()}] [${title}]: ${msg}`
}

const logger = {
    "log": function(msg) {
        console.log(construct(msg));
    },
    "error": function(msg) {
        console.log(chalk.red(construct(msg)));
    },
    "warn": function(msg) {
        console.log(chalk.yellow(construct(msg)));
    },
    "info": function(msg) {
        console.log(chalk.blue(construct(msg)));
    },
    "title": function(new_title) {
        title = new_title; 
        return logger;
    } 
}

export default logger;
const webminify = require('webminify');


webminify()
    .load('src/(jiax|event|observe|observe-array|style|store).js')
    .combine('\r\n\r\n\r\n')
    // .compressjs()
    .output('js/jiax.js');

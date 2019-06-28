const https = require('https');
const htmlparser = require('htmlparser2');

function promiseParkrunData(url, callback) {
    data = '';
    return new Promise((resolve, reject) => {
        console.log(`GET request to [${url}]`);
        https.get(url, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve(data);
            });
            res.on('error', (e) => reject({ msg: "Failed to load parkrun data.", err: e }));
        });
    });
}

function promiseHtml(url) {
    return new Promise((resolve, reject) => {
        promiseParkrunData(url).then((data) => {
            var handler = new htmlparser.DomHandler(function (err, dom) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(dom);
                }
            });
            var parser = new htmlparser.Parser(handler);
            parser.write(data);
            parser.end();
        });
    }, (err) => {
        console.log("ERROR");
        reject(err);
    });    
}


var loader = {
    loadUrl: (url) => {
        return promiseParkrunData(url);
    },
    loadHtml: (url) => {
        return promiseHtml(url);
    }
}

module.exports = loader
const https = require('https');
const htmlparser = require('htmlparser2');

const NodeCache = require( "node-cache" );
const parkrunCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

function promiseParkrunData(url) {
    data = '';
    return new Promise((resolve, reject) => {
        try {
            parkrunCache.get(url, (err, value) => {
                if (value) {
                    console.log(`Using cached version of [${url}]`);
                    resolve(value);
                }
                else {
                    getParkrunData(url, resolve, reject);
                }
            });
        }
        catch (err) {
            reject({ msg: "Failed to load parkrun data.", err: err });
        }
    });
}

function getParkrunData(url, resolve, reject) {
    console.log(`GET request to [${url}]`);
    let data = '';
    https.get(url, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            parkrunCache.set(url, data);
            resolve(data);
        });
        res.on('error', (e) => {
            console.error("Failed to get parkrun data", err);
            reject({ msg: "Failed to get parkrun data.", err: e })
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
        console.log(`ERROR: ${err}`);
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
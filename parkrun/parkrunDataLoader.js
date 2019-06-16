const https = require('https');

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


var loader = {
    loadUrl: (url) => {
        return promiseParkrunData(url);
    }
}

module.exports = loader
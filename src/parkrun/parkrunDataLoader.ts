const https = require("https");
const htmlparser = require("htmlparser2");

const NodeCache = require( "node-cache" );
const parkrunCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export class ParkrunDataLoader {

    private promiseParkrunData(url) {
        const data = "";
        return new Promise((resolve, reject) => {
            try {
                parkrunCache.get(url, (err, value) => {
                    if (value) {
                        console.log(`Using cached version of [${url}]`);
                        resolve(value);
                    }
                    else {
                        this.getParkrunData(url, resolve, reject);
                    }
                });
            }
            catch (err) {
                reject({ msg: "Failed to load parkrun data.", err: err });
            }
        });
    }

    private getParkrunData(url, resolve, reject) {
        console.log(`GET request to [${url}]`);
        let data = "";
        https.get(url, (res) => {
            res.setEncoding("utf8");
            res.on("data", (chunk) => data += chunk);
            res.on("end", () => {
                parkrunCache.set(url, data);
                resolve(data);
            });
            res.on("error", (e) => {
                console.error("Failed to get parkrun data", e);
                reject({ msg: "Failed to get parkrun data.", err: e });
            });
        });
    }

    private promiseHtml(url) {
        return new Promise((resolve, reject) => {
            try {
                this.promiseParkrunData(url).then((data) => {
                    const handler = new htmlparser.DomHandler(function(err, dom) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(dom);
                        }
                    });
                    const parser = new htmlparser.Parser(handler);
                    parser.write(data);
                    parser.end();
                });
            }
            catch (err) {
                console.log(`ERROR: ${err}`);
                reject(err);
            }
        });
    }

    public loadUrl(url) {
        return this.promiseParkrunData(url);
    }

    public loadHtml(url) {
        return this.promiseHtml(url);
    }

}

const https = require('https');
const xml2js = require('xml2js');

function matchRegion(regionDetail, regionName) {
    if (regionDetail && regionDetail.$) {
        //console.log(`Checking in region ${regionDetail.$.n}`)
        if (regionDetail.$.n.toLowerCase() === regionName.toLowerCase()) {
            return regionDetail;
        }
        else if (regionDetail.r) {
            return regionDetail.r.map(r => matchRegion(r, regionName)).reduce((acc, x) => acc.concat(x), []).find(x => x != null);
        }
    }
    return undefined;
}

function buildRegion(region, geo) {
    console.log(`Building ${region} from geo.xml`);
    var region_detail = matchRegion(geo['geo']['r'][0], region);
    return createRegion(region_detail, geo, null);
}

function createRegion(region_detail, geo, base_url) {
    if (region_detail) {
        var region = {
            name: region_detail.$.n,
            location: {
                lat: parseFloat(region_detail.$.la),
                long: parseFloat(region_detail.$.lo),
                zoom: parseInt(region_detail.$.z)                
            },
            regions : (region_detail.r ? region_detail.r.map(r => createRegion(r, geo, (region_detail.$.u ? region_detail.$.u : base_url))) : []),
            events: buildEvents(region_detail.$.id, geo, base_url),
        };
        
        if (region_detail.$.u) {
            region.url = region_detail.$.u;
        }

        return region;
    }
    else {
        return { msg: "Region not found." }
    }
}

function buildEvents(regionId, geo, base_url) {
    return geo['geo'].e.filter(e => e.$.r === regionId).map(e => createEvent(e, base_url));
}

function createEvent(e, base_url) {
    return {
        name: e.$.m,
        shortname: e.$.n,
        location: {
            lat: parseFloat(e.$.la),
            long: parseFloat(e.$.lo),
            zoom: parseInt(e.$.z)
        },
        url: `${base_url}/${e.$.n}`
    }
}

///
/// Countries
///
function buildCountries(geo) {
    console.log(`Building country list from geo.xml`);
    var region_detail = matchRegion(geo['geo']['r'][0], 'world');
    return createCountryList(region_detail);
}

function createCountryList(region_detail, geo) {
    if (region_detail) {
        return (region_detail.r ? region_detail.r.map(r => createCountry(r, geo)) : []);
    }
    else {
        return [];
    } 
}

function createCountry(region_detail) {
    console.log(region_detail);
    if (region_detail) {
        return {
            name: region_detail.$.n,
            location: {
                lat: region_detail.$.la,
                long: region_detail.$.lo,
                zoom: region_detail.$.z
            },
            url: region_detail.$.u
        };
    }
    else {
        return { msg: "Country not found." }
    }
}


///
/// Common code to return results from geo data
///
function promiseGeoData(geoDataFunction) {
    const geo_url = 'https://www.parkrun.org.uk/wp-content/themes/parkrun/xml/geo.xml';
    var geo_xml = '';
    return new Promise((resolve, reject) => {
        console.log(`GET request to [${geo_url}]`);
        https.get(geo_url, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => geo_xml += chunk);
            res.on('end', () => {
                xml2js.parseString(geo_xml, (err, results) => {
                    resolve(geoDataFunction(results));
                });
            });
            res.on('error', (e) => reject({ msg: "Failed to load parkrun geo.xml.", err: e }));
        });
    });
}

var geo = {
    loadRegion: (region) => {
        var geoDataFunction = (results) => {
            return buildRegion(region, results);
        };
        return promiseGeoData(geoDataFunction);
    },
    loadCountries: () => {
        var geoDataFunction = (results) => {
            return buildCountries(results);
        };
        return promiseGeoData(geoDataFunction);
    }
}

module.exports = geo
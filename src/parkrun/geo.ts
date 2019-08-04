const https = require('https');
const xml2js = require('xml2js');

import * as parkrun from '../parkrun/model/index.js'
import { ParkrunDataLoader } from './parkrunDataLoader'

export class GeoDataLoader {

    private matchRegion(regionDetail, regionName) {
        if (regionDetail && regionDetail.$) {
            //console.log(`Checking in region ${regionDetail.$.n}`)
            if (regionDetail.$.n.toLowerCase() === regionName.toLowerCase()) {
                return regionDetail;
            }
            else if (regionDetail.r) {
                return regionDetail.r.map(r => this.matchRegion(r, regionName)).reduce((acc, x) => acc.concat(x), []).find(x => x != null);
            }
        }
        return undefined;
    }

    private buildRegion(region, geo): parkrun.Region {
        console.log(`Building ${region} from geo.xml`);
        var region_detail = this.matchRegion(geo['geo']['r'][0], region);
        return this.createRegion(region_detail, geo, null);
    }

    private createRegion(region_detail, geo, base_url): parkrun.Region {
        if (region_detail) {
            var region = {
                name: region_detail.$.n,
                location: {
                    lat: parseFloat(region_detail.$.la),
                    long: parseFloat(region_detail.$.lo),
                    zoom: parseInt(region_detail.$.z)                
                },
                regions : (region_detail.r ? region_detail.r.map(r => this.createRegion(r, geo, (region_detail.$.u ? region_detail.$.u : base_url))) : []),
                events: this.buildEvents(region_detail.$.id, geo, base_url),
                url: null
            };
            
            if (region_detail.$.u) {
                region.url = region_detail.$.u;
            }

            return region;
        }
        else {
            throw new Error("Region not found.");
        }
    }

    private buildEvents(regionId, geo, base_url): parkrun.Event[] {
        return geo['geo'].e.filter(e => e.$.r === regionId).map(e => this.createEvent(e, base_url));
    }

    private createEvent(e, base_url): parkrun.Event {
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
    private buildCountries(geo): parkrun.Country[] {
        console.log(`Building country list from geo.xml`);
        var region_detail = this.matchRegion(geo['geo']['r'][0], 'world');
        return this.createCountryList(region_detail);
    }

    private createCountryList(region_detail): parkrun.Country[] {
        if (region_detail) {
            return (region_detail.r ? region_detail.r.map(r => this.createCountry(r)) : []);
        }
        else {
            return [];
        } 
    }

    private createCountry(region_detail): parkrun.Country {
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
            throw new Error("Country not found.");
        }
    }

    ///
    /// Common code to return results from geo data
    ///
    private promiseGeoData<T>(geoDataFunction): Promise<T> {
        const geo_url = 'https://www.parkrun.org.uk/wp-content/themes/parkrun/xml/geo.xml';
        return new Promise<T>((resolve, reject) => {
            try {
                const parkrunDataLoader = new ParkrunDataLoader();
                parkrunDataLoader.loadUrl(geo_url).then((data) => {
                    if (data) {                       
                        xml2js.parseString(data, (err, results) => {
                            resolve(geoDataFunction(results));
                        });
                    }
                    else {
                        reject({ msg: "No parkrun geo data loaded." });
                    }
                });
            }
            catch (err) {
                console.error("Failed to load and parse parkrun geo.xml", err);
                reject({ msg: "Failed to load and parse parkrun geo.xml.", err: err });
            }
        });
    }

    public loadRegion(region): Promise<parkrun.Region> {
        var geoDataFunction = (results) => {
            return this.buildRegion(region, results);
        };
        return this.promiseGeoData<parkrun.Region>(geoDataFunction);
    }
    
    public loadCountries(): Promise<parkrun.Country[]> {
        var geoDataFunction = (results) => {
            return this.buildCountries(results);
        };
        return this.promiseGeoData<parkrun.Country[]>(geoDataFunction);
    }

}


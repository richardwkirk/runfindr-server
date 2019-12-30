import https = require("https");
import * as parkrun from "../parkrun/model/index.js";
import { ParkrunDataLoader } from "./parkrunDataLoader";
import Countries = require("./countries.json");
import { CancellationLoader } from "./cancellationLoader.js";

export class EventDataLoader {

    private buildCountries(geo, seriesId): parkrun.Country[] {
        console.log(`Building country list from events.json`);
        if (geo) {
            const countries = Object.keys(geo.countries).map((k) => this.createCountry(geo.countries[k], k));
            this.addEvents(geo, countries, seriesId);
            return countries;
        }
        else {
            return [];
        }
    }

    private createCountry(countryDetail, countryCode): parkrun.Country {
        return {
            name: this.getCountryNameFromUrl(countryDetail.url),
            countryCode: +countryCode,
            bounds: {
                north: countryDetail.bounds[3],
                east: countryDetail.bounds[2],
                south: countryDetail.bounds[1],
                west: countryDetail.bounds[0]
            },
            url: `https://${countryDetail.url}`,
            events: []
        };
    }

    private addEvents(geo, countries, seriesId): void {
        for (const eventDetails of geo.events.features) {

            // Match series - senior or junior
            if (eventDetails.properties.seriesid !== seriesId) {
                continue;
            }

            // Add a new event to the relevant country
            const country = countries.find((c: { countryCode: any; }) => c.countryCode === eventDetails.properties.countrycode);
            if (!country) {
                console.error(`Could not find country for event...`);
                console.error(eventDetails);
                continue;
            }

            const event = {
                eventName: eventDetails.properties.eventname,
                shortName: eventDetails.properties.EventShortName,
                longName: eventDetails.properties.EventLongName,
                id: eventDetails.id,
                locationName: eventDetails.properties.EventLocation,
                location: {
                    long: eventDetails.geometry.coordinates[0],
                    lat: eventDetails.geometry.coordinates[1]
                },
                url: `${country.url}/${eventDetails.properties.eventname}`
            };

            country.events.push(event);
        }
    }

    private getCountryNameFromUrl(url: string): string {
        const countryCode = url.substring(url.length - 2, url.length);
        return Countries[countryCode];
    }

    ///
    /// Common code to return results from geo data
    ///
    private promiseGeoData<T>(geoDataFunction): Promise<T> {
        const geoUrl = "https://images.parkrun.com/events.json";
        return new Promise<T>((resolve, reject) => {
            try {
                const parkrunDataLoader = new ParkrunDataLoader();
                parkrunDataLoader.loadUrl(geoUrl).then((data) => {
                    if (data) {
                        const geo = JSON.parse(data as string);
                        const allCountries = this.buildCountries(geo, 1);
                        resolve(geoDataFunction(allCountries));
                    }
                    else {
                        reject({ msg: "No parkrun geo data loaded." });
                    }
                });
            }
            catch (err) {
                console.error("Failed to load and parse parkrun events data.", err);
                reject({ msg: "Failed to load and parse parkrun events data.", err: err });
            }
        });
    }

    private populateWorldOrCountry(allCountries, countryName) {
        if (countryName.toLowerCase() === "world") {
            const world: parkrun.Country = {
                name: "World",
                countryCode: 0,
                url: "https://www.parkrun.com/",
                events: [].concat.apply([], allCountries.map((c) => c.events))
            };
            return world;
        }
        else {
            return allCountries.find((c) => c.name.toLowerCase() === countryName.toLowerCase());
        }
    }

    public loadRegion(countryName): Promise<parkrun.Country> {
        const geoDataFunction = (allCountries) => {
            console.log(`Filtering for country ${countryName}`);

            const world = this.populateWorldOrCountry(allCountries, countryName);

            try {
                const cancellationLoader = new CancellationLoader();
                return cancellationLoader.decorateEvents(world);
            }
            catch (err) {
                console.error('Failed to decorate cancellations');
                return world;
            }
        };
        return this.promiseGeoData<parkrun.Country>(geoDataFunction);
    }

    public loadCountries(): Promise<parkrun.Country[]> {
        const geoDataFunction = (allCountries: parkrun.Country[]) => {
            allCountries.forEach((c) => delete (c.events));
            return allCountries;
        };
        return this.promiseGeoData<parkrun.Country[]>(geoDataFunction);
    }

}

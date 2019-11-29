import { ParkrunDataLoader } from "./parkrunDataLoader";
import { Country } from "./model/Country";
import { HtmlParserHelper } from "./htmlParserHelper";
import { SpecialEventTimes } from "./model/Event";

export class SpecialEventLoader {

    private timeMatch = new RegExp(/^\d\d:\d\d$/);

    private getEventTime(time: string) {
        if (time) {
            if (this.timeMatch.test(time)) {
                return time;
            }
            else {
                return "None";
            }
        }
        return "Unknown";
    }

    private getEventTimesFromTable(tableBodyElement): { [url: string]: SpecialEventTimes } {
        const eventTimes = {};
        const rowElements = HtmlParserHelper.findElementsInHtml(tableBodyElement.children, "tr");
        for (const row of rowElements) {
            const dataElements = HtmlParserHelper.findElementsInHtml(row.children, "td");
            if (dataElements.length >= 4) {
                const longName = HtmlParserHelper.getTextFromElement(dataElements[0]);
                if (longName) {
                    const extra = this.getEventTime(HtmlParserHelper.getTextFromElement(dataElements[2]));
                    const newyear = this.getEventTime(HtmlParserHelper.getTextFromElement(dataElements[3]));
                    eventTimes[longName] = {
                        extra: extra,
                        newyear: newyear
                    };
                }
            }
        }
        return eventTimes;
    }

    private extractCompendiumStatus(compendiumDom): { [eventName: string]: SpecialEventTimes } {
        const tableElements = HtmlParserHelper.findElementsInHtml(compendiumDom, "table");
        if (tableElements.length > 0) {
            return this.getEventTimesFromTable(tableElements[0]);
        }
        return {};
    }

    public loadCompendium(country: Country): Promise<{ [eventName: string]: SpecialEventTimes }> {
        return new Promise((resolve, reject) => {
            try {
                const parkrunDataLoader = new ParkrunDataLoader();
                parkrunDataLoader.loadHtml(`${country.url}/special-events/`).then((compendiumDom) => {
                    resolve(this.extractCompendiumStatus(compendiumDom));
                });
            }
            catch (err) {
                console.error(`Failed to load compendium for ${country.name}.`, err);
                reject(err);
            }
        });
    }

    private getCountriesFromTableBody(tableBodyElement): { [country: string]: string } {
        const countries = {};
        const rowElements = HtmlParserHelper.findElementsInHtml(tableBodyElement.children, "tr");
        for (const row of rowElements) {
            const dataElements = HtmlParserHelper.findElementsInHtml(row.children, "td");
            if (dataElements.length >= 2) {
                const countryName = HtmlParserHelper.getTextFromElement(dataElements[0]);
                if (countryName) {
                    const specialEvent = HtmlParserHelper.getTextFromElement(dataElements[1]);
                    countries[countryName] = specialEvent;

                    const alternativeCountryName = this.getAlternativeCountryName(countryName);
                    if (alternativeCountryName) {
                        countries[alternativeCountryName] = specialEvent;
                    }
                }
            }
        }
        return countries;
    }

    public getAlternativeCountryName(countryName: string): string {
        switch (countryName) {
            case "United Kingdom":
                return "UK";
            case "United States":
                    return "USA";
        }
        return null;
    }

    private extractSpecialEvents(dom): { [country: string]: string } {
        const tableBodyElements = HtmlParserHelper.findElementsInHtml(dom, "tbody");
        if (tableBodyElements.length > 1) {
            return this.getCountriesFromTableBody(tableBodyElements[1]);
        }
        return {};
    }

    public loadSpecialEvents(): Promise<{ [country: string]: string }> {
        return new Promise((resolve, reject) => {
            try {
                const parkrunDataLoader = new ParkrunDataLoader();
                parkrunDataLoader.loadHtml(`https://support.parkrun.com/hc/en-us/articles/200565633-Special-Events`).then((sepcialEventsDom) => {
                    resolve(this.extractSpecialEvents(sepcialEventsDom));
                });
            }
            catch (err) {
                console.error(`Failed to load special event list.`, err);
                reject(err);
            }
        });
    }

    public decorateCountries(countries: Country[]): Promise<Country[]> {
        return new Promise<Country[]>((resolve, reject) => {
            this.loadSpecialEvents().then((events) => {
                for (const country of countries) {
                    country.specialEvent = events[country.name];
                }
                resolve(countries);
            }, (err: any) => {
                reject(err);
            });
        });
    }

    public decorateEvents(country: Country): Promise<Country> {
        return new Promise<Country>((resolve, reject) => {
            this.decorateCountries([ country ]).then((countries) => {
                this.loadCompendium(country).then((events) => {
                    for (const event of country.events) {
                        event.specialEventTimes = events[event.longName];
                    }
                    resolve(country);
                }, (err: any) => {
                    reject(err);
                });
            }, (err: any) => {
                reject(err);
            });
        });
    }

}

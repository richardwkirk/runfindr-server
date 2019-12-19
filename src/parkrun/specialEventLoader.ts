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
        let columnIndexes = {};

        let first = true;
        const eventTimes = {};
        const rowElements = HtmlParserHelper.findElementsInHtml(tableBodyElement.children, "tr");
        for (const row of rowElements) {

            if (first)
            {
                columnIndexes = this.getColumnIndexesForSpecialEvents(row);
                first = false;
                continue;
            }

            const dataElements = HtmlParserHelper.findElementsInHtml(row.children, "td");
            if (dataElements.length >= 2) {
                const longName = HtmlParserHelper.getTextFromElement(dataElements[0]);
                eventTimes[longName] = {};

                if (longName) {
                    this.addEventTimeForSpecialEvent(eventTimes[longName], columnIndexes, "extra", dataElements);
                    this.addEventTimeForSpecialEvent(eventTimes[longName], columnIndexes, "newyear", dataElements);
                }
            }
        }
        return eventTimes;
    }

    private addEventTimeForSpecialEvent(eventTimes: any, columnIndexes: any, type: string, dataElements: any) {
        if (columnIndexes[type])
        {
            eventTimes[type] = this.getEventTime(HtmlParserHelper.getTextFromElement(dataElements[columnIndexes[type]]));
        }
    }

    private getColumnIndexesForSpecialEvents(row: any): {} {
        const columnIndexes = {};
        const dataElements = HtmlParserHelper.findElementsInHtml(row.children, "th");
        for (let i = 2; i < dataElements.length; ++i)
        {
            const type = this.isNewYear(HtmlParserHelper.getTextFromElement(dataElements[i])) ? "newyear" : "extra";
            columnIndexes[type] = i;
        }
        return columnIndexes;
    }

    private isNewYear(text: string): boolean {
        const newyearMatchers = ["New Year", "Neujahr", "元旦", "Nytårsdag", "Jour de l'an", "Capodanno", "Nowy Rok", "Новый год", "Nyårsdagen"];
        if (text)
        {
            for (const matcher of newyearMatchers)
            {
                if (text.toLowerCase().startsWith(matcher.toLowerCase())) {
                    console.log(`New year is ${text}`);
                    return true;
                }
            }
        }
        console.log(`New year is not ${text}`);
        return false;
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

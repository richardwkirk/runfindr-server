import { ParkrunDataLoader, ParserFactory } from "./parkrunDataLoader";
import { Country } from "./model/Country";
import { Cancellation } from "./model/Event";
import { Parser } from "htmlparser2";

export class CancallationParserFactory implements ParserFactory {

  public createParser(resolve: any, reject: any) {
    const dateRegex = /\d\d\d\d-\d\d-\d\d/;
    const reasonRegex = /: /;
    const cancellations = {};
    let parsingType = null;
    let date = null;
    let event = null;
    const parser = new Parser(
      {
        onopentag(name, attribs) {
          if (name === "h1") {
            parsingType = 'date';
          }
          else if (name === "a") {
            parsingType = 'event';
          }
          else {
            parsingType = null;
          }
        },
        onclosetag() {
          if (parsingType === 'event') {
            parsingType = 'reason';
          }
        },
        ontext(text) {
          if (text && parsingType !== 'unknown') {
            if (parsingType === 'date' && text.match(dateRegex)) {
              date = text;
            }
            else if (parsingType === 'event') {
              event = text;
            }
            else if (parsingType === 'reason' && text.length > 2 && text.startsWith(':')) {
              if (date && event) {
                if (!cancellations.hasOwnProperty(event)) {
                  cancellations[event] = [];
                }
                cancellations[event].push({ date: date, reason: text.substr(2) });
              }
            }
            else {
              date = null;
              event = null;
            }
          }
        },
        onend() {
          resolve(cancellations);
        }
      },
      { decodeEntities: true }
    );
    return parser;
  }
}

export class CancellationLoader {

  private extractCancellationDataFromDom() {

  }

  private extractCancellations(data): { [eventName: string]: Cancellation[] } {
    return data;
  }

  public loadCancellations(country: Country): Promise<{ [eventName: string]: Cancellation[] }> {
    return new Promise((resolve, reject) => {
      try {
        const parkrunDataLoader = new ParkrunDataLoader();
        parkrunDataLoader
          .loadHtml(`${country.url}/cancellations/`, new CancallationParserFactory())
          .then((data) => {
            resolve(this.extractCancellations(data));
          });
      } catch (err) {
        console.error(`Failed to load cancellations for ${country.name}.`, err);
        reject(err);
      }
    });
  }

  public decorateEvents(country: Country): Promise<Country> {
    return new Promise<Country>((resolve, reject) => {
      this.loadCancellations(country).then(
        events => {
          for (const event of country.events) {
            event.cancellations = events[event.longName];
          }
          country.cancellationsLoaded = true;
          resolve(country);
        },
        (err: any) => {
          reject(err);
        }
      );
    });
  }
}

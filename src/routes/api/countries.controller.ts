import * as express from "express";
import { Controller } from "./controller";
import { EventDataLoader } from "../../parkrun/eventDataLoader";
import { SpecialEventLoader } from "../../parkrun/specialEventLoader";

export class CountriesController extends Controller {

  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get("/", this.getCountries);
    this.router.get("/special", this.getCountrySpecials);
  }

  private static loadCountries(callback: (error, data?) => void) {
    console.log(`Loading country data...`);

    const geo = new EventDataLoader();

    geo.loadCountries().then((result: any) => {
        callback(null, result);
    }, (err: any) => {
        callback(err);
    });
  }

  private getCountries(req: express.Request, res: express.Response) {
    console.log(`Country list request.`);

    CountriesController.loadCountries((error, data) => {
      if (error) {
        res.status(400).json(error);
      }
      else {
        res.json(data);
      }
    });
  }

  private getCountrySpecials(req: express.Request, res: express.Response) {
    console.log(`Country special list request.`);

    CountriesController.loadCountries((error, data) => {
      if (error) {
        res.status(400).json(error);
      }
      else {
        const special = new SpecialEventLoader();

        special.decorateCountries(data).then((result: any) => {
          res.json(result);
        }, (err: any) => {
          res.status(400).json(err);
        });

      }
    });
  }
}

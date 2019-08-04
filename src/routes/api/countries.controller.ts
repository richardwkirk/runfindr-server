import * as express from "express";
import { Controller } from "./controller";
import { GeoDataLoader } from "../../parkrun/geo";

export class CountriesController extends Controller {

  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get("/", this.getCountries);
  }

  private getCountries(req: express.Request, res: express.Response) {
    console.log(`Country list request.`);

    const geo = new GeoDataLoader();

    geo.loadCountries().then((result: any) => {
            res.json(result);
        }, (err: any) => {
            res.status(400).json(err);
        });
  }
}

import * as express from "express";
import { Controller } from "./controller";

export class CountriesController extends Controller {

  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get("/", this.getCountries);
  }

  private getCountries(req: express.Request, res: express.Response) {
    const geo = require("../../parkrun/geo");

    console.log(`Country load request.`);

    geo.loadCountries().then((result) => {
        res.json(result);
    }, (err) => {
        res.status(400).json(err);
    });
  }
}
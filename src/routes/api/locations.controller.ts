import * as express from "express";
import { Controller } from "./controller";

export class LocationsController extends Controller {

  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get("/:region", this.getRegion);
  }

  private getRegion(req: express.Request, res: express.Response) {
    const geo = require("../../parkrun/geo");

    console.log(`Location request for [${req.params.region}]`);

    geo.loadRegion(req.params.region).then((result: any) => {
            res.json(result);
        }, (err: any) => {
            res.status(400).json(err);
        });
  }
}

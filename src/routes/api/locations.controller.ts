import * as express from "express";
import { Controller } from "./controller";
import { EventDataLoader } from "../../parkrun/eventDataLoader";

export class LocationsController extends Controller {

  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get("/:region", this.getRegion);
  }

  private getRegion(req: express.Request, res: express.Response) {
    console.log(`Location request for [${req.params.region}]`);

    const geo = new EventDataLoader();

    geo.loadRegion(req.params.region).then((result: any) => {
            res.json(result);
        }, (err: any) => {
            res.status(400).json(err);
        });
  }
}

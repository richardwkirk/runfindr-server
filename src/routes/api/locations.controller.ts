import * as express from "express";
import { Controller } from "./controller";
import { EventDataLoader } from "../../parkrun/eventDataLoader";
import { SpecialEventLoader } from "../../parkrun/specialEventLoader";

export class LocationsController extends Controller {

  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get("/:region", this.getRegion);
    this.router.get("/:region/special", this.getEventSpecials);
  }

  private static loadRegion(region: string, callback: (error, data?) => void) {
    console.log(`Loading event data for ${region}...`);

    const geo = new EventDataLoader();

    geo.loadRegion(region).then((result: any) => {
        callback(null, result);
    }, (err: any) => {
        callback(err);
    });
  }

  private getRegion(req: express.Request, res: express.Response) {
    console.log(`Location request for [${req.params.region}]`);

    LocationsController.loadRegion(req.params.region, (error, data) => {
      if (error) {
        res.status(400).json(error);
      }
      else {
        res.json(data);
      }
    });
  }

  private getEventSpecials(req: express.Request, res: express.Response) {
    console.log(`Special event request for [${req.params.region}]`);

    const geo = new EventDataLoader();

    LocationsController.loadRegion(req.params.region, (error, data) => {
      if (error) {
        res.status(400).json(error);
      }
      else {
        const special = new SpecialEventLoader();

        special.decorateEvents(data).then((result: any) => {
          res.json(result);
        }, (err: any) => {
          res.status(400).json(err);
        });
      }
    });

  }

}

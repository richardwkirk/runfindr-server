import * as express from "express";
import { Controller } from "./controller";

export class AthletesController extends Controller {

  public router = express.Router();

  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get("/:region", this.getRegion);
  }

  private getRegion(req: express.Request, res: express.Response) {
    const athleteData = require("../../parkrun/athleteData");

    console.log(`Athlete history request for [${req.params.athleteId}]`);
    athleteData.loadHistory(req.params.athleteId).then((result) => {
        res.json(result);
    }, (err) => {
        res.status(400).json(err);
    });
  }
}

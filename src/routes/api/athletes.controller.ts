import * as express from "express";
import { Controller } from "./controller";
import { AthleteDataLoader } from "../../parkrun/athleteDataLoader";

export class AthletesController extends Controller {

  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get("/history/:athleteId", this.getAthleteData);
  }

  private getAthleteData(req: express.Request, res: express.Response) {
    console.log(`Athlete history request for [${req.params.athleteId}]`);

    let athleteData = new AthleteDataLoader();

    athleteData.loadHistory(req.params.athleteId).then((result) => {
        res.json(result);
    }, (err) => {
        res.status(400).json(err);
    });
  }
}

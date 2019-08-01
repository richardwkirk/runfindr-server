import * as express from "express";
import { Controller } from "./routes/api/controller";
import { AthletesController } from "./routes/api/athletes.controller";
import { CountriesController } from "./routes/api/countries.controller";
import { LocationsController } from "./routes/api/locations.controller";

class App {
  public express;

  constructor() {
    this.express = express();
    this.initMiddleware();
    this.initRoutes();
  }

  private corsMiddleware(req: express.Request, res: express.Response, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  }

  private initMiddleware(): void {
    // Cross origin support
    this.express.use(this.corsMiddleware);

    // Body parser middleware
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
  }

  private initRoutes(): void {
    this.addRoutes("/api/locations", new LocationsController());
    this.addRoutes("/api/countries", new CountriesController());
    this.addRoutes("/api/athletes", new AthletesController());
  }

  private addRoutes(endpoint: string, controller: Controller) {
    this.express.use("/api/locations", require("./routes/api/locations"));
  }

}

export default new App().express;

import * as express from "express";
import { Controller } from "./routes/api/controller";
import { AthletesController } from "./routes/api/athletes.controller";
import { CountriesController } from "./routes/api/countries.controller";
import { LocationsController } from "./routes/api/locations.controller";

export class App {
  public app: express.Application;

  constructor() {
    this.app = express();
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
    this.app.use(this.corsMiddleware);

    // Body parser middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private initRoutes(): void {
    this.addRoutes("/api/athletes", new AthletesController());
    this.addRoutes("/api/countries", new CountriesController());
    this.addRoutes("/api/locations", new LocationsController());
  }

  private addRoutes(endpoint: string, controller: Controller) {
    this.app.use(endpoint, controller.router);
  }

  public listen(port: number) {
    this.app.listen(port, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Server started on port ${port}`);
    });
  }
}

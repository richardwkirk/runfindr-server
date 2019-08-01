import * as express from "express";

export abstract class Controller {

  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  protected abstract initRoutes(): void;

}

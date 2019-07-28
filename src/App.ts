import * as express from 'express';

class App {
  public express;

  constructor() {
    this.express = express();
    this.mountRoutes();
  }

  private mountRoutes(): void {
    // cors middleware - cross origin support
    this.express.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    // Body parser middleware
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));

    this.express.use('/api/locations', require('../routes/api/locations'));
    this.express.use('/api/countries', require('../routes/api/countries'));
    this.express.use('/api/athletes', require('../routes/api/athletes'));
  }

}

export default new App().express



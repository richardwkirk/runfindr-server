import { App } from "./App";

const port: number = +process.env.PORT || 5000;

const app = new App();

app.listen(port);

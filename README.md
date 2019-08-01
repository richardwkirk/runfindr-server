# runfindr-server

The `runfindr-server` project supports `runfindr-web` by providing access to underlying parkrun data. The server parses data from the parkrun website into a format that can then be presented through the web interface used by [runfindr.uk](http://www.runfindr.uk). The project was structured in this way as a learning exercise into developing a node.js web-api using express. There are alternative ways that this data could be retrieved however for the purposes of trying out new technologies which has always been a key factor in how this project has evolved.

The current advantage of having a separation between the data source and web front end is that the front end is not impacted directly by the changes being made by parkrun to their website. It also keeps some of the less maintainable parts of the code base out of the front end.

---

## parkrun data

runfindr is not associated with the parkrun organisation. The runfindr projects are used to present parkrun data in different ways. No result data is stored for use beyond the reformatting of the data available through the [parkrun](https://www.parkrun.com) websites. This project is developed as a personal interest project to explore new technologies using an interesting subject matter.

---

## Build

Originally written in JavaScript, this project is being converted into Typescript. As a result the build process is currently in a state of flux.

To build the project run:

```
npm run build
```

This will run the Typescript compile (`tsc` command).

## Run

You can run the build either as a server:

```
npm run start
````

Or in dev mode using `nodemon` to automatically update when changes are made:

```
npm run dev
```



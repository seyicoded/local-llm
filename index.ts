import express, {Express, Request, Response, urlencoded} from 'express';
// import dB from './models/index'
import router from './src/routes';
import winston from 'winston'
import 'dotenv/config'
import { run } from './src/helper/defaultRunner';
import path from 'path';
import morgan from 'morgan';

// import chalk from 'chalk';
// const chalk = import("chalk");
// const chalk = require("chalk");

const app: Express = express();
const port = process.env.PORT || 3000;

// const log = console.log;
// log(chalk.blue.bgRed.bold("reached"));
// console.log = (...r)=> log(chalk.blue.bgRed.bold(r));

app.use(urlencoded({
    extended: false
}));

app.use(express.json());

// // init database
// dB.sequelize.sync({alter: true});

// // create default data

(async()=>{
  // init database
  // await dB.sequelize.sync({force: true});
  // console.log("[database]: Done Syncing")
  // create default data
  // run();
})();

// app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(morgan('dev'));

// init route
app.use(router);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// @TODO: create a cron action that checks for post and status older than 24 hours and disable them

app.listen(port, ()=> {
console.log(`[Server]: I am running at https://localhost:${port}`);
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
}
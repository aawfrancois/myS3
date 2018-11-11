import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser'
import dotenv from 'dotenv';
import {mLog} from './lib/utils';
import {db as database} from './models';
import routes from './routes';
import "./middlewares/passport"

dotenv.config();

const port = parseInt(process.argv[2], 10) || process.env.PORT;
const app = express();
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const start = async () => {
    try {
        await database.authenticate();
        if (process.env.APP === 'development') {
            database.sync({force: false});
        }

        app.use('/api', routes);
        app.listen(port, (err) => {
            if (err) {
                throw err;
            } else {
                mLog(`Server is running on port ${port}`, 'cyan');
            }
        });
    } catch (e) {
        throw e;
    }
}
start();

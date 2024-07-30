import * as dotenv from 'dotenv';
import { App } from './app';

dotenv.config();

const PORT =  3001;

new App().start(PORT);

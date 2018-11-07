import * as dotenv from 'dotenv';
import * as path from 'path';
import { APP_ROOT_PATH } from './app.constant';

const envFilePath = path.join(APP_ROOT_PATH, '.env');

const result = dotenv.config({
  path: envFilePath,
});

if (result.error) {
  throw result.error;
}

export const envContent = result.parsed;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as R from 'ramda';
import { envContent } from './load-env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(R.defaultTo(3000, envContent.PORT)));
}
bootstrap();

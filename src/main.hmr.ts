import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envContent } from './load-env';
import * as R from 'ramda';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(R.defaultTo(3000, envContent.PORT)));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

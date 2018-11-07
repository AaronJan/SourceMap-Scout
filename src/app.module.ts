import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SourceMapScoutService } from './app.service';
import { ConfigModule } from './config.module';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    SourceMapScoutService,
  ],
})
export class AppModule { }

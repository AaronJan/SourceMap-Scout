import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { envContent } from './load-env';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(envContent),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule { }
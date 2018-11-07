import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { SourceMapScoutService } from './app.service';
import { ConfigService } from './config.service';
import { of } from 'rxjs';
import * as path from 'path';
import { APP_ROOT_PATH } from './app.constant';
import { Position } from 'source-map';

describe('AppController', () => {
  let app: TestingModule;
  let sourceMapScoutService = {
    load: () => of(),
    scout: (file: string, position: Position) => { },
  };
  let configService = {
    get: (name: string) => { },
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
    })
      .overrideProvider(SourceMapScoutService)
      .useValue(sourceMapScoutService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();
  });

  describe('root', () => {
    it('should return a cool slogan', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.root()).toBe('This is SourceMap-Scout yo.');
    });
  });

  describe('scout', () => {
    it('should tell the source code position', done => {
      const appController = app.get<AppController>(AppController);
      const compiledPositon = { line: 123, column: 321 };
      const mockPayload = { ...compiledPositon, file: 'app.js.map' };

      jest.spyOn(sourceMapScoutService, 'scout').mockImplementationOnce((file: string, position: Position) => {
        expect(file).toBe(path.resolve(`${APP_ROOT_PATH}/sourcemaps/app.js.map`));
        expect(position).toEqual(compiledPositon);

        return of({
          source: 'webpack://app.js',
          name: 'variable',
          line: 512,
          column: 215,
        });
      });
      jest.spyOn(configService, 'get').mockImplementationOnce((key: string) => {
        expect(key).toBe('SOURCEMAP_FOLDER');

        return 'sourcemaps/';
      });

      appController.originalPosition(mockPayload).subscribe({
        next: responsePayload => {
          expect(responsePayload).toEqual({
            statusCode: 200,
            data: {
              source: 'webpack://app.js',
              name: 'variable',
              line: 512,
              column: 215,
            },
          });
        },
        complete: done,
      });
    });
  });
});

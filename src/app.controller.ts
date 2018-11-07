import { Get, Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { SourceMapScoutService } from './app.service';
import { ConfigService } from './config.service';
import { ScoutPayload } from './request.dto';
import * as R from 'ramda';
import * as path from 'path';
import { map, mergeMap } from 'rxjs/operators';
import { APP_ROOT_PATH } from './app.constant';
import { Position } from 'source-map';

@Controller()
export class AppController {
  constructor(
    private readonly sourceMapScoutService: SourceMapScoutService,
    private readonly configService: ConfigService,
  ) { }

  @Get()
  root(): string {
    return 'This is SourceMap-Scout yo.';
  }

  @Post('original-position')
  @UsePipes(new ValidationPipe({ transform: true }))
  originalPosition(
    @Body() payload: ScoutPayload,
  ) {
    const file = path.join(APP_ROOT_PATH, this.configService.get('SOURCEMAP_FOLDER', 'sourcemaps'), payload.file);
    const compiledPosition: Position = R.pickAll(['line', 'column'], payload);

    return this.sourceMapScoutService.load(file)
      .pipe(
        mergeMap(() => this.sourceMapScoutService.scout(file, compiledPosition)),
        map(sourcePosition => ({
          statusCode: 200,
          data: sourcePosition,
        }))
      );
  }
}

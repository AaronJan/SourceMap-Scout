import { Injectable } from '@nestjs/common';
import { SourceMapConsumer, NullableMappedPosition, Position } from 'source-map';
import { of, Observable } from 'rxjs';
import * as R from 'ramda';
import { map, filter, tap, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { parseJsonFromFile, makeSourceMapConsumer } from './helper';
import { ConfigService } from './config.service';

@Injectable()
export class SourceMapScoutService {
  protected sourceMapLimit: number;
  protected sourceMapConsumerMap: R.Dictionary<SourceMapConsumer>;
  protected sourceMapFiles: string[];

  constructor(protected configService: ConfigService) {
    this.sourceMapLimit = Math.max(
      1,
      Number(configService.get('IN_MEMORY_SOURCEMAP_LIMIT', 5))
    );
    this.sourceMapConsumerMap = {};
    this.sourceMapFiles = [];
  }

  forgetOldestIfIsFull() {
    if (this.sourceMapFiles.length >= this.sourceMapLimit) {
      this.forget(R.head(this.sourceMapFiles));
    }
  }

  remember(file: string, consumer: SourceMapConsumer) {
    this.sourceMapFiles = R.append(file, this.sourceMapFiles);
    this.sourceMapConsumerMap[file] = <any>consumer;
  }

  forget(file: string) {
    this.sourceMapConsumerMap[file].destroy();
    this.sourceMapFiles = R.without([file], this.sourceMapFiles);
    this.sourceMapConsumerMap = R.dissoc(file, this.sourceMapConsumerMap);
  }

  has(file: string) {
    return R.has(file, this.sourceMapConsumerMap);
  }

  get(file: string) {
    return this.sourceMapConsumerMap[file];
  }

  load(file: string) {
    if (this.has(file)) {
      return of(this.get(file));
    }

    return parseJsonFromFile(file)
      .pipe(
        mergeMap(makeSourceMapConsumer),
        tap(consumer => {
          this.remember(file, consumer);
          this.forgetOldestIfIsFull();
        })
      );
  }

  scout(file: string, position: Position): Observable<NullableMappedPosition> {
    return of(this.get(file))
      .pipe(
        filter(consumer => !R.isEmpty(consumer)),
        throwIfEmpty(() => new Error(`source map file not found`)),
        map(comsumer => comsumer.originalPositionFor(position))
      );
  }
}

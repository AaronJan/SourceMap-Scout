import { SourceMapScoutService } from './app.service';
import { ConfigService } from './config.service';
import * as R from 'ramda';
import { RawSourceMap } from 'source-map';
import { of } from 'rxjs';

jest.mock('fs');

describe('SourceMapScoutService', () => {
  const makeConfigService = (limit?: number): ConfigService => {
    return <any>{
      get: (key: string, defaultValue?: string | number) => R.defaultTo(
        (defaultValue === undefined ? undefined : String(defaultValue)),
        limit
      ),
    };
  };

  it('should read `IN_MEMORY_SOURCEMAP_LIMIT` config', () => {
    const sourceMapScout = new SourceMapScoutService(makeConfigService(9));

    expect(Reflect.get(sourceMapScout, 'sourceMapLimit')).toBe(9);
  });

  it('should have a default value for `sourceMapLimit`', () => {
    const sourceMapScout = new SourceMapScoutService(makeConfigService());

    expect(Reflect.get(sourceMapScout, 'sourceMapLimit')).toBe(5);
  });

  it('should remember', () => {
    const SourceMapConsumerStub = {
      isStub: true,
      destroy: () => void 0,
    };
    const sourceMapScout = new SourceMapScoutService(makeConfigService(3));

    sourceMapScout.remember('/app.js.map', <any>SourceMapConsumerStub);

    expect(Reflect.get(sourceMapScout, 'sourceMapConsumerMap')).toEqual({
      '/app.js.map': SourceMapConsumerStub,
    });
    expect(Reflect.get(sourceMapScout, 'sourceMapFiles')).toEqual(['/app.js.map']);
  });

  it('should forget', () => {
    const SourceMapConsumerStub = {
      isStub: true,
      destroy: () => void 0,
    };
    const sourceMapScout = new SourceMapScoutService(makeConfigService(3));

    sourceMapScout.remember('/app.js.map', <any>SourceMapConsumerStub);
    sourceMapScout.forget('/app.js.map');

    expect(Reflect.get(sourceMapScout, 'sourceMapConsumerMap')).toEqual({});
    expect(Reflect.get(sourceMapScout, 'sourceMapFiles')).toEqual([]);
  });

  it('should forget oldest', () => {
    const SourceMapConsumerStubA = {
      id: 'A',
      isStub: true,
      destroy: () => void 0,
    };
    const SourceMapConsumerStubB = {
      id: 'B',
      isStub: true,
      destroy: () => void 0,
    };
    const SourceMapConsumerStubC = {
      id: 'C',
      isStub: true,
      destroy: () => void 0,
    };
    const sourceMapScout = new SourceMapScoutService(makeConfigService(3));

    sourceMapScout.remember('/app_a.js.map', <any>SourceMapConsumerStubA);
    sourceMapScout.remember('/app_b.js.map', <any>SourceMapConsumerStubB);
    sourceMapScout.remember('/app_c.js.map', <any>SourceMapConsumerStubC);
    sourceMapScout.forgetOldestIfIsFull();

    expect(Reflect.get(sourceMapScout, 'sourceMapConsumerMap')).toEqual({
      '/app_b.js.map': SourceMapConsumerStubB,
      '/app_c.js.map': SourceMapConsumerStubC,
    });
    expect(Reflect.get(sourceMapScout, 'sourceMapFiles')).toEqual([
      '/app_b.js.map',
      '/app_c.js.map',
    ]);
  });

  it('should load a SourceMapConsumer', done => {
    const rawSourceMap: RawSourceMap = {
      "version": 3,
      "file": "example2.js",
      "sourceRoot": "",
      "sources": ["src/example.ts"],
      "names": [],
      "mappings": "AAAA,SAAS,GAAG,CAAC,CAAS;IACpB,OAAO,CAAC,CAAC,MAAM,CAAC;AAClB,CAAC;AAED,GAAG,CAAC,aAAa,CAAC,CAAC",
    };

    const sourceMapConsumerStub = {
      isStub: true,
      destroy: () => void 0,
    };

    const fs = require('fs');
    fs.readFile.mockImplementationOnce((path: string, callback: Function) => {
      callback(null, Buffer.from(JSON.stringify(rawSourceMap)));
    });

    // Actual creating a SourceMapConsumer would invoke `fs.readFile`, because 
    // `fs.readFile` already have been mocked, so we have to mock `makeSourceMapConsumer` as well.
    const helper = require('./helper');
    helper.makeSourceMapConsumer = jest.fn().mockImplementationOnce((json) => {
      expect(json).toEqual(rawSourceMap);

      return of(<any>sourceMapConsumerStub);
    });

    const sourceMapScout = new SourceMapScoutService(makeConfigService(3));

    const spyRemoveOldestIfIsFull = jest.spyOn(sourceMapScout, 'forgetOldestIfIsFull');

    sourceMapScout.load('/development.env').subscribe({
      next: comsumer => {
        expect(spyRemoveOldestIfIsFull).toHaveBeenCalledTimes(1);
        expect(comsumer).toEqual(sourceMapConsumerStub);
      },
      error: err => {
        throw err;
      },
      complete: done,
    });
  });

  it('should return source code position', done => {
    const compiledPosition = {
      line: 1,
      column: 11,
    };
    const sourceCodePosition = {
      "source": 'example.js',
      "line": 3,
      "column": 5,
      "name": 'variable',
    };
    const sourceMapConsumerStub = {
      isStub: true,
      originalPositionFor: position => {
        expect(position).toEqual(compiledPosition);

        return sourceCodePosition;
      },
      destroy: () => void 0,
    };

    const sourceMapScout = new SourceMapScoutService(makeConfigService(3));

    sourceMapScout.remember('/example.js.map', <any>sourceMapConsumerStub);

    sourceMapScout.scout('/example.js.map', compiledPosition)
      .subscribe({
        next: position => expect(position).toEqual(sourceCodePosition),
        error: err => expect(err).not.toThrow(),
        complete: done,
      });
  });
});

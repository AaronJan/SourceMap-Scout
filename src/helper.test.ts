import { SourceMapConsumer, RawSourceMap } from 'source-map';
import {
  isFileExist,
  readWholeFileContent,
  parseJsonFromFile,
  makeSourceMapConsumer,
} from './helper';

jest.mock('fs');

describe('function: isFileExist', () => {
  it('return `true` if file does exist', done => {
    const fs = require('fs');
    fs.access.mockImplementationOnce((path: string, mode: number, callback: Function) => callback(null));

    isFileExist('/readme.md')
      .subscribe({
        next: existed => expect(existed).toBeTruthy(),
        complete: done,
      });
  });

  it('return `false` if file does not exist', done => {
    const fs = require('fs');
    fs.access.mockImplementationOnce((path: string, mode: number, callback: Function) => callback(new Error('file does not existed')));

    isFileExist('/readme.md')
      .subscribe({
        next: existed => expect(existed).toBeFalsy(),
        complete: done,
      });
  });
});

describe('function: readWholeFileContent', () => {
  it('can read file', done => {
    const filePath = '/readme.md';
    const fileContent = 'sdfs';

    const fs = require('fs');
    fs.readFile.mockImplementationOnce((path: string, callback: Function) => {
      expect(path).toBe(filePath);
      callback(null, Buffer.from(fileContent));
    });

    readWholeFileContent(filePath)
      .subscribe({
        next: content => expect(content).toBe(fileContent),
        complete: done,
      });
  });

  it('throw error when file does not exist', done => {
    const filePath = '/readme.md';
    const humbleFunction = jest.fn();
    const error = new Error('file does not exist');

    const fs = require('fs');
    fs.readFile.mockImplementationOnce((path: string, callback: Function) => {
      expect(path).toBe(filePath);
      callback(error);
    });

    readWholeFileContent(filePath)
      .subscribe({
        next: expect(humbleFunction).not.toBeCalled(),
        error: err => {
          expect(err).toBe(error);
          done();
        },
        complete: humbleFunction,
      });
  });
});

describe('function: parseJsonFromFile', () => {
  it('can parse JSON', done => {
    const filePath = '/message.json';
    const jsonContent = '{"name":"Aaron"}';
    const jsonObject = { name: "Aaron" };

    const fs = require('fs');
    fs.readFile.mockImplementationOnce((path: string, callback: Function) => {
      expect(path).toBe(filePath);
      callback(null, Buffer.from(jsonContent));
    });

    parseJsonFromFile(filePath)
      .subscribe({
        next: content => expect(content).toMatchObject(jsonObject),
        complete: done,
      });
  });
});

describe('function: makeSourceMapConsumer', () => {
  it('can make SourceMapConsumer', () => {
    const stubSourceMap: RawSourceMap = {
      "version": 3,
      "file": "example.js",
      "sourceRoot": "",
      "sources": ["src/example.ts"],
      "names": [],
      "mappings": "AAAA,SAAS,GAAG,CAAC,CAAS;IACpB,OAAO,CAAC,CAAC,MAAM,CAAC;AAClB,CAAC;AAED,GAAG,CAAC,aAAa,CAAC,CAAC",
    };

    makeSourceMapConsumer(stubSourceMap).subscribe({
      next: consumer => {
        expect(consumer).toBeInstanceOf(SourceMapConsumer);
        consumer.destroy();
      },
    });
  });
});

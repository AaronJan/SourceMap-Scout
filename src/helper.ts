import { bindNodeCallback, pipe, concat, of, from } from 'rxjs';
import { map, mapTo, catchError } from 'rxjs/operators';
import * as fs from 'fs';
import * as R from 'ramda';
import { SourceMapConsumer, RawSourceMap } from 'source-map';

const fsAccessRead = R.curryN(2, bindNodeCallback<string, number>(fs.access))(R.__, fs.constants.R_OK);

export const isFileExist = pipe(
    fsAccessRead,
    mapTo(true),
    catchError(() => of(false)),
);

export const readWholeFileContent = pipe(
    bindNodeCallback(fs.readFile),
    concat,
    map<Buffer, string>(buffer => buffer.toString('utf8'))
);

export const parseJsonFromFile = pipe(
    readWholeFileContent,
    map(content => JSON.parse(content))
);

export const makeSourceMapConsumer = (sourceMapJson: RawSourceMap) => from(new SourceMapConsumer(sourceMapJson));

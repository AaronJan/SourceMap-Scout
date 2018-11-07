import * as R from 'ramda';

export class ConfigService {
  constructor(private readonly config: R.Dictionary<string>) { }

  get(key: string, defaultValue?: string | number): string | undefined {
    return R.defaultTo((defaultValue === undefined ? undefined : String(defaultValue)), this.config[key]);
  }
}
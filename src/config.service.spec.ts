import { ConfigService } from './config.service';

describe('ConfigService', () => {
  const configContent = {
    SOURCEMAP_FOLDER: '/app/souremaps/',
    CONFIG_2: '123',
  };

  it('work as expected', () => {
    const config = new ConfigService(configContent);

    expect(config.get('SOURCEMAP_FOLDER')).toBe('/app/souremaps/');
    expect(config.get('CONFIG_2')).toBe('123');

    expect(Reflect.get(config, 'config')).toEqual({
      SOURCEMAP_FOLDER: '/app/souremaps/',
      CONFIG_2: '123',
    });
  });

  it('return default value if key does not exist', () => {
    const config = new ConfigService(configContent);

    expect(config.get('NONEXISTENT_CONFIG', 'default value')).toBe('default value');
  });
});

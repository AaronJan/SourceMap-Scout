<h1 align=center>
    SourceMap Scout
</h1>

Source map as a HTTP service.


## Usage

```shell
$ git clone https://github.com/aaronjan/sourcemap-scout.git sourcemap-scout
$ cd sourcemap-scout
$ npm install
$ cp .env.example .env
# If you're using PM2:
$ pm2 start
# Else:
$ npm start
```


## Configure

You can tweak `SourceMap-Scout` by editing the `.env` file:

### PORT

HTTP service port.


### IN_MEMORY_SOURCEMAP_LIMIT

Specify how many source map files should be kept in memory. Older files will be automatically removed.


### SOURCEMAP_FOLDER

Specify the folder that has all the source map files.


## API

### Get original source position for a compiled source position.

```
POST /original-position
```

Request payload (`application/json`):

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| file | string | yes | Source map's file path, relative to the `SOURCEMAP_FOLDER` folder (default is: `sourcemaps/`) |
| line | integer | yes | The line number in the compiled source |
| column | integer | yes | The column number in the compiled source |

Request example:

```json
{
	"file": "example.js.map",
	"line": 2,
	"column": 4
}
```

Response - Success (`statusCode: 200`):

```json
{
	"statusCode": 200,
	"data": {
        "source": "../src/example.ts",
        "line": 2,
        "column": 2,
		"name": "key"
	}
}
```

Data:

| Name | Type | Description |
| --- | --- | --- |
| source | string or null | The original source file, or null if this information is not available. |
| line | integer or null | The line number in the original source, or null if this information is not available. The line number is 1-based. |
| column | integer or null | The column number in the original source, or null if this information is not available. The column number is 0-based. |
| name | string or null | The original identifier, or null if this information is not available. |


# License

Licensed under the [APACHE LISENCE 2.0](http://www.apache.org/licenses/LICENSE-2.0).

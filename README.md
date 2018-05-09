serviceberry-json-schema
========================

[![CircleCI](https://circleci.com/gh/bob-gray/serviceberry-json-schema.svg?style=svg)](https://circleci.com/gh/bob-gray/serviceberry-json-schema)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5a4fc498c6e90455f103/test_coverage)](https://codeclimate.com/github/bob-gray/serviceberry-jwt/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/5a4fc498c6e90455f103/maintainability)](https://codeclimate.com/github/bob-gray/serviceberry-jwt/maintainability)
[![npm version](https://badge.fury.io/js/serviceberry-json-schema.svg)](https://badge.fury.io/js/serviceberry-json-schema)

JSON Schema validator plugin for [Serviceberry](https://serviceberry.js.org). For
more information visit [json-schema.org](http://json-schema.org).

Install
-------
```shell-script
npm install serviceberry-json-schema
```

Usage
-----
This plugin exports a function that create handlers. To use this
plugin, call this function with a schema object and an optional [options](#options)
object. The second argument can be a validator instance instead that has a
`compile` method that returns a `validate` function.


```js
const jsonSchema = require("serviceberry-json-schema");

trunk.use(jsonSchema({
	type: "object",
	properties: {
		firstName: {
			type: "string"
		},
		lastName: {
			type: "string"
		}
	},
	required: [
		"firstName",
		"lastName"
	]
}
}));
```

jsonSchema(schema[, options])
-----------------------------
  - **schema** *object*

    [JSON Schema](http://json-schema.org/)

  - **options** *object*

    [Ajv Options](https://www.npmjs.com/package/ajv#options).


jsonSchema(schema, validator)
-----------------------------
  - **schema** *object*

    [JSON Schema](http://json-schema.org/)

  - **validator** *object*

    [Ajv](https://www.npmjs.com/package/ajv) instance or any object that has a
	`compile` method that takes the `schema` and returns a `validate` function.
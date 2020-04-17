serviceberry-json-schema
========================

[![CircleCI](https://circleci.com/gh/bob-gray/serviceberry-json-schema.svg?style=svg)](https://circleci.com/gh/bob-gray/serviceberry-json-schema)
[![Test Coverage](https://api.codeclimate.com/v1/badges/991c894da2d8a7d8465c/test_coverage)](https://codeclimate.com/github/bob-gray/serviceberry-json-schema/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/991c894da2d8a7d8465c/maintainability)](https://codeclimate.com/github/bob-gray/serviceberry-json-schema/maintainability)
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
This plugin exports a function that creates handlers. To use this
plugin, call this function with a schema object and an optional options
object. The second argument can also be a validator instance.
Validators are objects with a `compileAsync` method that returns
a `validate` function (such as a [Ajv](https://www.npmjs.com/package/ajv)
instance) If an options object is passed, a new Ajv instance is created.


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
}));
```

async jsonSchema(schema[, param][, options])
--------------------------------------------

  - **schema** *object*

    [JSON Schema](http://json-schema.org/)

  - **param** *string*
     
    A dot delimited identifier specifying the request parameter to be validated. In the form of "*type.name*"
    or "*type*" where *type* is one of *path*, *query*, *header*, *body*, or *all* or *param* is the name of an own
    property of the request object.
    
    Defaults to *all* which is equivalent to [`request.getParams()`](https://serviceberry.js.org/docs/request#getparams).
    Other examples include: "body" ([`request.getBody()`](https://serviceberry.js.org/docs/request#getbody)),
    "body.widget" ([`request.getBodyParam("widget")`](https://serviceberry.js.org/docs/request#getbodyparam)),
    "header.Content-Length"  ([`request.getHeader("Content-Length")`](https://serviceberry.js.org/docs/request#getheader))...

  - **options** *object*

    [Ajv Options](https://www.npmjs.com/package/ajv#options)


async jsonSchema(schema[, param][, validator])
----------------------------------------------

  - **schema** *object*

    [JSON Schema](http://json-schema.org/)

  - **param** *string*
     
    See above

  - **validator** *object*

    [Ajv](https://www.npmjs.com/package/ajv) instance or any object that has a `compileAsync` method that takes the `schema`
    and returns a `validate` function.

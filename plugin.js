"use strict";

const Ajv = require("ajv"),
	{HttpError} = require("serviceberry"),
	get = {
		all,
		path,
		query,
		header,
		body
	},
	getByName = {
		path: pathByName,
		query: queryByName,
		header: headerByName,
		body: bodyByName
	};

async function jsonSchema (schema, param, options = {}) {
	var ajv,
		paramGetter;

	if (arguments.length === 2 && typeof param !== "string") {
		options = param;
		param = undefined;
	}

	paramGetter = getParamGetter(param);

	if (options.compileAsync) {
		ajv = options;
	} else {
		ajv = new Ajv(Object.assign({loadSchema: Function.prototype}, options));
	}

	return validator.bind(this, await ajv.compileAsync(schema), paramGetter);
}

async function validator (validate, paramGetter, request) {
	var errors;

	try {
		if (!await validate(paramGetter(request))) {
			errors = validate.errors;
		}
	} catch (error) {
		// when async validation fails await will cause the failure to be thrown
		// validation errors will have an errors property
		if (error.errors) {
			errors = error.errors;
		} else {
			throw error;
		}
	}

	if (errors) {
		throw new HttpError(getMessage(errors), "Unprocessable Entity");
	}
}

function getParamGetter (param = "all") {
	var parts = param.split("."),
		[type, name] = parts,
		getters,
		getter;

	if (name) {
		getters = getByName;
	} else {
		getters = get;
	}

	if (getters.hasOwnProperty(type)) {
		getter = getters[type].bind(null, ...parts.slice(1));
	} else {
		getter = getOwnRequestProperty.bind(null, type);
	}

	return getter;
}

function all (request) {
	return request.getParams();
}

function path (request) {
	return request.getPathParams();
}

function query (request) {
	return request.getQueryParams();
}

function header (request) {
	return request.getHeaders();
}

function body (request) {
	return request.getBody();
}

function pathByName (name, request) {
	return request.getPathParam(name);
}

function queryByName (name, request) {
	return request.getQueryParam(name);
}

function headerByName (name, request) {
	return request.getHeader(name);
}

function bodyByName (name, request) {
	return request.getBodyParam(name);
}

function getOwnRequestProperty (name, request) {
	if (!request.hasOwnProperty(name)) {
		throw Error(
			`serviceberry-json-schema: request has no own property "${name}".` +
				`Did you indent to use a getter: ${Object.keys(get).join(", ")}?`
		);
	}

	return request[name];
}

function getMessage (errors) {
	return errors.map(toMessages).join("\n");
}

function toMessages (error) {
	return error.dataPath.slice(1) + " " + error.message;
}

module.exports = jsonSchema;

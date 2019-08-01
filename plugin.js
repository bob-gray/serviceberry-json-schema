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

function jsonSchema (schema, options = {}) {
	var ajv,
		paramGetter = getParamGetter(options.param);

	if (options.compile) {
		ajv = options;
	} else {
		delete options.param;
		ajv = new Ajv(options);
	}

	return validator.bind(this, ajv.compile(schema), paramGetter);
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
		getters;

	if (name) {
		getters = getByName;
	} else {
		getters = get;
	}

	if (!getters.hasOwnProperty(type)) {
		throw Error(`serviceberry-json-schema: unknown request param "${param}"`);
	}

	return getters[type].bind(null, ...parts.slice(1));
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

function getMessage (errors) {
	return errors.map(toMessages).join("\n");
}

function toMessages (error) {
	return error.message;
}

module.exports = jsonSchema;

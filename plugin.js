"use strict";

const Ajv = require("ajv"),
	{HttpError} = require("serviceberry");

function jsonSchema (schema, options = {}) {
	var ajv;

	if (options.compile) {
		ajv = options;
	} else {
		ajv = new Ajv(options);
	}

	return validator.bind(this, ajv.compile(schema));
}

async function validator (validate, request) {
	var errors;

	try {
		if (!await validate(request.getParams())) {
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

function getMessage (errors) {
	return errors.map(toMessages).join("\n");
}

function toMessages (error) {
	return error.message;
}

module.exports = jsonSchema;

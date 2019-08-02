/* globals expectAsync */

"use strict";

const jsonSchema = require("../plugin"),
	Request = require("serviceberry/src/Request"),
	{HttpError} = require("serviceberry"),
	httpMocks = require("node-mocks-http");

describe("serviceberry-json-schema", () => {
	var schema,
		handler,
		request;

	beforeEach(() => {
		schema = {
			title: "Person",
			type: "object",
			properties: {
				firstName: {
					type: "string"
				},
				lastName: {
					type: "string"
				},
				age: {
					description: "Age in years",
					type: "integer",
					minimum: 0
				}
			},
			required: [
				"firstName",
				"lastName"
			]
		};
		handler = jsonSchema(schema);
		request = createRequest({
			firstName: "John",
			lastName: "Doe"
		});
	});

	it("should create a handler", () => {
		expect(typeof handler).toBe("function");
	});

	it("should not throw when params are valid", () => {
		return expectAsync(handler(request)).toBeResolved();
	});

	it("should throw when the params are not valid", async () => {
		request = createRequest({
			name: "John Doe"
		});

		try {
			await handler(request);
			fail();
		} catch (error) {
			expect(error.is("Unprocessable Entity")).toBe(true);
			expect(error.is(422)).toBe(true);
		}
	});

	it("should throw when the params are not valid with an async schema", async () => {
		request = createRequest({
			name: "John Doe"
		});

		try {
			schema.$async = true;
			handler = jsonSchema(schema);
			await handler(request);
			fail();
		} catch (error) {
			expect(error.is("Unprocessable Entity")).toBe(true);
			expect(error.is(422)).toBe(true);
		}
	});

	it("should except a second argument of an instance that has a compile method", async () => {
		handler = jsonSchema({}, {
			compile () {
				// compile schema
			}
		});

		expect(typeof handler).toBe("function");
	});

	it("should rethrow errors that are not schema related", async () => {
		request.getParams.and.throwError(new HttpError("Oops!"));

		try {
			await handler(request);
			fail();
		} catch (error) {
			expect(error.message).toBe("Oops!");
			expect(error.is(500)).toBe(true);
		}

		expect(typeof handler).toBe("function");
	});

	it("should throw an error when param is not a getter and is undefined on request", async () => {
		var promise;

		handler = jsonSchema(schema, "foo");

		promise = handler(request);

		await expectAsync(promise).toBeRejected();

		promise.catch(error => {
			expect(error.message.startsWith("serviceberry-json-schema: request has no own property")).toBe(true);
		});
	});

	it("should get a param as a own property of request", async () => {
		handler = jsonSchema(schema, "foo");

		request.foo = request.getParams();

		await expectAsync(handler(request)).toBeResolved();
	});

	it("should validate the path params", async () => {
		handler = jsonSchema(schema, "path");

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getPathParams).toHaveBeenCalled();
	});

	it("should validate a named path param", async () => {
		schema = {
			type: "string"
		};

		handler = jsonSchema(schema, "path.firstName");

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getPathParam).toHaveBeenCalledWith("firstName");
	});

	it("should validate the query params", async () => {
		handler = jsonSchema(schema, "query");

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getQueryParams).toHaveBeenCalled();
	});

	it("should validate a named query param", async () => {
		schema = {
			type: "string"
		};

		handler = jsonSchema(schema, "query.firstName");

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getQueryParam).toHaveBeenCalledWith("firstName");
	});

	it("should validate the header params", async () => {
		handler = jsonSchema(schema, "header");

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getHeaders).toHaveBeenCalled();
	});

	it("should validate a named header param", async () => {
		schema = {
			type: "string"
		};

		handler = jsonSchema(schema, "header.firstName");

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getHeader).toHaveBeenCalledWith("firstName");
	});

	it("should validate the body", async () => {
		handler = jsonSchema(schema, "body");

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getBody).toHaveBeenCalled();
	});

	it("should validate a named body param", async () => {
		handler = jsonSchema(schema, "body.person");

		request = createRequest({
			person: request.getParams()
		});

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getBodyParam).toHaveBeenCalledWith("person");
	});

	it("should validate an array body", async () => {
		schema = {
			type: "array",
			items: schema
		};

		handler = jsonSchema(schema, "body");

		request = createRequest([request.getParams()]);

		await expectAsync(handler(request)).toBeResolved();

		expect(request.getBody).toHaveBeenCalled();
	});
});

function createRequest (params) {
	var incomingMessage = httpMocks.createRequest({
			url: "/"
		}),
		request;

	incomingMessage.setEncoding = Function.prototype;
	request = new Request(incomingMessage);
	Object.assign(request, jasmine.createSpyObj("request", [
		"getParams",
		"getPathParams",
		"getPathParam",
		"getQueryParams",
		"getQueryParam",
		"getHeaders",
		"getHeader",
		"getBody",
		"getBodyParam"
	]));
	request.getParams.and.returnValue(params);

	request.getPathParams.and.returnValue(params);
	request.getPathParam.and.callFake(byName.bind(null, params));

	request.getQueryParams.and.returnValue(params);
	request.getQueryParam.and.callFake(byName.bind(null, params));

	request.getHeaders.and.returnValue(params);
	request.getHeader.and.callFake(byName.bind(null, params));

	request.getBody.and.returnValue(params);
	request.getBodyParam.and.callFake(byName.bind(null, params));

	return request;
}

function byName (params, name) {
	return params[name];
}

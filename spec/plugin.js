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

	it("should not throw when params are valid", async () => {
		expect(await handler(request)).toBeUndefined();
	});

	it("should throw when the params are not valid", async () => {
		try {
			await handler(createRequest({
				name: "John Doe"
			}));
			fail();
		} catch (error) {
			expect(error.is("Unprocessible Entity")).toBe(true);
		}
	});

	it("should throw when the params are not valid with an async schema", async () => {
		try {
			schema.$async = true;
			handler = jsonSchema(schema);
			await handler(createRequest({
				name: "John Doe"
			}));
			fail();
		} catch (error) {
			expect(error.is("Unprocessible Entity")).toBe(true);
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

	it("should rethrow error that are not schema related", async () => {
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
});

function createRequest (params) {
	var incomingMessage = httpMocks.createRequest({
			url: "/"
		}),
		request;

	incomingMessage.setEncoding = Function.prototype;
	request = new Request(incomingMessage);
	request.getParams = jasmine.createSpy("request.getParams")
		.and.returnValue(params);

	return request;
}

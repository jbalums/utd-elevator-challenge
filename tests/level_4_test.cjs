require("babel-core/register")({
	ignore: /node_modules\/(?!ProjectB)/,
});

const assert = require("chai").assert;
const Elevator = require("../src/elevator").default;
const Person = require("../src/person").default;

describe("Level 4 Elevator Tests", function () {
	let elevator;

	beforeEach(function () {
		elevator = new Elevator();
	});

	describe("multiple riders in request order", function () {
		it("should pick up and drop off each person in the order of the requests", () => {
			const bob = new Person("Bob", 3, 9);
			const sue = new Person("Sue", 6, 2);
			elevator.checkReturnToLoby = () => false;
			elevator.requests = [bob, sue];

			elevator.dispatch();

			assert.equal(elevator.currentFloor, 2);
			assert.equal(elevator.floorsTraversed, 16);
			assert.equal(elevator.stops, 4);
			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders.length, 0);
		});

		it("should keep the first request as the first completed trip", () => {
			const personA = new Person("Beverly", 3, 6);
			const personB = new Person("James", 5, 1);
			elevator.checkReturnToLoby = () => false;
			elevator.requests = [personA, personB];

			elevator.dispatch();

			assert.equal(elevator.currentFloor, 1);
			assert.equal(elevator.floorsTraversed, 11);
			assert.equal(elevator.stops, 4);
		});
	});
});

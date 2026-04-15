require("babel-core/register")({
	ignore: /node_modules\/(?!ProjectB)/,
});

const assert = require("chai").assert;
const Elevator = require("../src/elevator").default;
const Person = require("../src/person").default;

describe("Level 5 Elevator Tests", function () {
	let elevator;

	beforeEach(function () {
		elevator = new Elevator();
		elevator.checkReturnToLoby = () => false;
	});

	describe("multiple rider scenarios", function () {
		it("Person A goes up and Person B goes up", () => {
			const personA = new Person("Oliver", 3, 6);
			const personB = new Person("Angela", 1, 5);
			elevator.requests = [personA, personB];

			elevator.dispatch();

			assert.equal(elevator.stops, 4);
			assert.equal(elevator.floorsTraversed, 6);
			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders.length, 0);
		});

		it("Person A goes up and Person B goes down", () => {
			const personA = new Person("Beverly", 3, 6);
			const personB = new Person("James", 5, 1);
			elevator.requests = [personA, personB];

			elevator.dispatch();

			assert.equal(elevator.stops, 4);
			assert.equal(elevator.floorsTraversed, 11);
			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders.length, 0);
		});

		it("Person A goes down and Person B goes up", () => {
			const personA = new Person("Jeanne", 7, 1);
			const personB = new Person("Karl", 2, 8);
			elevator.requests = [personA, personB];

			elevator.dispatch();

			assert.equal(elevator.stops, 4);
			assert.equal(elevator.floorsTraversed, 15);
			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders.length, 0);
		});

		it("Person A goes down and Person B goes down", () => {
			const personA = new Person("Max", 8, 2);
			const personB = new Person("Charlie", 5, 0);
			elevator.requests = [personA, personB];

			elevator.dispatch();

			assert.equal(elevator.stops, 4);
			assert.equal(elevator.floorsTraversed, 16);
			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders.length, 0);
		});
	});
});

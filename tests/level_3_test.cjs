require("babel-core/register")({
	ignore: /node_modules\/(?!ProjectB)/,
});

const assert = require("chai").assert;
const Elevator = require("../src/elevator").default;
const Person = require("../src/person").default;

describe("Level 3 Elevator Tests", function () {
	let elevator;

	beforeEach(function () {
		elevator = new Elevator();
	});

	describe("efficiency tracking", function () {
		it("should start with zero total floors traversed and zero total stops", () => {
			assert.equal(elevator.floorsTraversed, 0);
			assert.equal(elevator.stops, 0);
		});

		it("should track total floors traversed and stops when Person A goes up", () => {
			const personA = new Person("Brittany", 2, 5);
			elevator.checkReturnToLoby = () => false;

			elevator.goToFloor(personA);

			assert.equal(elevator.floorsTraversed, 5);
			assert.equal(elevator.stops, 2);
		});

		it("should track total floors traversed and stops when Person A goes down", () => {
			const personA = new Person("Brittany", 8, 3);
			elevator.checkReturnToLoby = () => false;

			elevator.goToFloor(personA);

			assert.equal(elevator.floorsTraversed, 13);
			assert.equal(elevator.stops, 2);
		});

		it("should keep adding totals across multiple trips", () => {
			const personA = new Person("Anne", 1, 3);
			const personB = new Person("Bob", 2, 4);
			elevator.checkReturnToLoby = () => false;

			elevator.goToFloor(personA);
			elevator.goToFloor(personB);

			assert.equal(elevator.floorsTraversed, 6);
			assert.equal(elevator.stops, 4);
		});

		it("should display total floors traversed and total stops made", () => {
			const personA = new Person("Brittany", 2, 5);
			elevator.checkReturnToLoby = () => false;

			elevator.goToFloor(personA);

			console.log("total floors traversed:", elevator.floorsTraversed);
			console.log("total stops made:", elevator.stops);

			assert.equal(elevator.floorsTraversed, 5);
			assert.equal(elevator.stops, 2);
		});

		it("should reset total floors traversed and stops back to zero", () => {
			elevator.floorsTraversed = 10;
			elevator.stops = 4;

			elevator.reset();

			assert.equal(elevator.floorsTraversed, 0);
			assert.equal(elevator.stops, 0);
		});
	});
});

require("babel-core/register")({
	ignore: /node_modules\/(?!ProjectB)/,
});

const assert = require("chai").assert;
const Elevator = require("../src/elevator").default;
const Person = require("../src/person").default;

describe("Level 2 Elevator Tests", function () {
	let elevator;

	beforeEach(function () {
		elevator = new Elevator();
	});

	describe("rider scenarios", function () {
		it("Person A goes up", () => {
			const personA = new Person("Brittany", 2, 5);
			elevator.checkReturnToLoby = () => false;

			elevator.goToFloor(personA);

			assert.equal(elevator.currentFloor, 5);
			assert.equal(elevator.floorsTraversed, 5);
			assert.equal(elevator.stops, 2);
		});

		it("Person A goes down", () => {
			const personA = new Person("Brittany", 8, 3);
			elevator.checkReturnToLoby = () => false;

			elevator.goToFloor(personA);

			assert.equal(elevator.currentFloor, 3);
			assert.equal(elevator.floorsTraversed, 13);
			assert.equal(elevator.stops, 2);
		});
	});

	describe("Elevator methods", function () {
		it("dispatch should process a request", () => {
			const personA = new Person("Anne", 1, 3);
			elevator.checkReturnToLoby = () => false;
			elevator.requests.push(personA);

			elevator.dispatch();

			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders.length, 0);
			assert.equal(elevator.currentFloor, 3);
		});

		it("goToFloor should pick up and drop off a rider", () => {
			const personA = new Person("Anne", 2, 4);
			elevator.checkReturnToLoby = () => false;

			elevator.goToFloor(personA);

			assert.equal(elevator.currentFloor, 4);
			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders.length, 0);
		});

		it("moveUp should move the elevator up once", () => {
			elevator.moveUp();

			assert.equal(elevator.currentFloor, 1);
			assert.equal(elevator.floorsTraversed, 1);
		});

		it("moveDown should move the elevator down once", () => {
			elevator.currentFloor = 1;

			elevator.moveDown();

			assert.equal(elevator.currentFloor, 0);
			assert.equal(elevator.floorsTraversed, 1);
		});

		it("hasStop should return true for a pickup floor", () => {
			const request = new Person("Bob", 4, 6);
			elevator.currentFloor = 4;
			elevator.requests.push(request);

			assert.equal(elevator.hasStop(), true);
		});

		it("hasPickup should move a request into riders", () => {
			const request = new Person("Anne", 3, 1);
			elevator.currentFloor = 3;
			elevator.requests.push(request);

			elevator.hasPickup();

			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders[0], request);
		});

		it("hasDropoff should remove a rider at the current floor", () => {
			const rider = new Person("Anne", 1, 3);
			elevator.currentFloor = 3;
			elevator.riders.push(rider);

			elevator.hasDropoff();

			assert.equal(elevator.riders.length, 0);
		});

		it("checkReturnToLoby should return true before noon with no riders", () => {
			const RealDate = Date;

			global.Date = class extends RealDate {
				getHours() {
					return 9;
				}
			};

			elevator.currentFloor = 5;

			assert.equal(elevator.checkReturnToLoby(), true);

			global.Date = RealDate;
		});

		it("returnToLoby should bring the elevator back to floor 0", () => {
			elevator.currentFloor = 4;

			elevator.returnToLoby();

			assert.equal(elevator.currentFloor, 0);
		});

		it("reset should clear elevator state", () => {
			elevator.currentFloor = 4;
			elevator.stops = 2;
			elevator.floorsTraversed = 4;
			elevator.requests.push(new Person("Anne", 4, 2));
			elevator.riders.push(new Person("Bob", 1, 4));

			elevator.reset();

			assert.equal(elevator.currentFloor, 0);
			assert.equal(elevator.stops, 0);
			assert.equal(elevator.floorsTraversed, 0);
			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders.length, 0);
		});

		it("processCurrentFloor should handle a stop on the current floor", () => {
			const request = new Person("Anne", 3, 5);
			elevator.currentFloor = 3;
			elevator.requests.push(request);

			elevator.processCurrentFloor(true);

			assert.equal(elevator.stops, 1);
			assert.equal(elevator.requests.length, 0);
			assert.equal(elevator.riders[0], request);
		});

		it("travelToFloor should move the elevator to the target floor", () => {
			elevator.travelToFloor(3);

			assert.equal(elevator.currentFloor, 3);
			assert.equal(elevator.floorsTraversed, 3);
		});
	});
});

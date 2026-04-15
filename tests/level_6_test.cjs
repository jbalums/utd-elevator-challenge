require("babel-core/register")({
	ignore: /node_modules\/(?!ProjectB)/,
});

const assert = require("chai").assert;
const Elevator = require("../src/elevator").default;
const Person = require("../src/person").default;

describe("Level 6 Elevator Tests", function () {
	let elevator;
	let RealDate;

	beforeEach(function () {
		elevator = new Elevator();
		RealDate = Date;
	});

	afterEach(function () {
		global.Date = RealDate;
	});

	describe("return to lobby behavior", function () {
		it("should return to floor 0 when there are no riders and the time is before 12:00 p.m.", () => {
			global.Date = class extends RealDate {
				getHours() {
					return 9;
				}
			};

			const personA = new Person("Brittany", 2, 5);

			elevator.goToFloor(personA);

			assert.equal(elevator.currentFloor, 0);
			assert.equal(elevator.riders.length, 0);
		});

		it("should stay on the last drop off floor when there are no riders and the time is after 12:00 p.m.", () => {
			global.Date = class extends RealDate {
				getHours() {
					return 13;
				}
			};

			const personA = new Person("Brittany", 2, 5);

			elevator.goToFloor(personA);

			assert.equal(elevator.currentFloor, 5);
			assert.equal(elevator.riders.length, 0);
		});
	});
});

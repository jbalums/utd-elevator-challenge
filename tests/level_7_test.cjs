require("babel-core/register")({
	ignore: /node_modules\/(?!ProjectB)/,
});

const assert = require("chai").assert;
const Elevator = require("../src/elevator").default;
const Person = require("../src/person").default;

describe("Level 7 Elevator Tests", function () {
	function buildElevators(personA, personB) {
		const efficientElevator = new Elevator();
		const requestOrderElevator = new Elevator();

		efficientElevator.checkReturnToLoby = () => false;
		requestOrderElevator.checkReturnToLoby = function () {
			return (
				this.currentFloor > 0 &&
				this.requests.length === 0 &&
				this.riders.length === 0
			);
		};

		efficientElevator.requests = [personA, personB];
		requestOrderElevator.requests = [
			new Person(personA.name, personA.currentFloor, personA.dropOffFloor),
			new Person(personB.name, personB.currentFloor, personB.dropOffFloor),
		];

		return { efficientElevator, requestOrderElevator };
	}

	describe("more efficient algorithm", function () {
		it("should traverse fewer floors when Person A goes up and Person B goes up", () => {
			const personA = new Person("Oliver", 3, 6);
			const personB = new Person("Angela", 1, 5);
			const { efficientElevator, requestOrderElevator } = buildElevators(
				personA,
				personB,
			);

			efficientElevator.dispatch();
			requestOrderElevator.dispatchInRequestOrder();

			assert.equal(efficientElevator.floorsTraversed, 6);
			assert.equal(requestOrderElevator.floorsTraversed, 22);
			assert.isBelow(
				efficientElevator.floorsTraversed,
				requestOrderElevator.floorsTraversed,
			);
		});

		it("should traverse fewer floors when Person A goes up and Person B goes down", () => {
			const personA = new Person("Beverly", 3, 6);
			const personB = new Person("James", 5, 1);
			const { efficientElevator, requestOrderElevator } = buildElevators(
				personA,
				personB,
			);

			efficientElevator.dispatch();
			requestOrderElevator.dispatchInRequestOrder();

			assert.equal(efficientElevator.floorsTraversed, 11);
			assert.equal(requestOrderElevator.floorsTraversed, 22);
			assert.isBelow(
				efficientElevator.floorsTraversed,
				requestOrderElevator.floorsTraversed,
			);
		});

		it("should traverse fewer floors when Person A goes down and Person B goes up", () => {
			const personA = new Person("Jeanne", 7, 1);
			const personB = new Person("Karl", 2, 8);
			const { efficientElevator, requestOrderElevator } = buildElevators(
				personA,
				personB,
			);

			efficientElevator.dispatch();
			requestOrderElevator.dispatchInRequestOrder();

			assert.equal(efficientElevator.floorsTraversed, 15);
			assert.equal(requestOrderElevator.floorsTraversed, 30);
			assert.isBelow(
				efficientElevator.floorsTraversed,
				requestOrderElevator.floorsTraversed,
			);
		});

		it("should traverse fewer floors when Person A goes down and Person B goes down", () => {
			const personA = new Person("Max", 8, 2);
			const personB = new Person("Charlie", 5, 0);
			const { efficientElevator, requestOrderElevator } = buildElevators(
				personA,
				personB,
			);

			efficientElevator.dispatch();
			requestOrderElevator.dispatchInRequestOrder();

			assert.equal(efficientElevator.floorsTraversed, 16);
			assert.equal(requestOrderElevator.floorsTraversed, 26);
			assert.isBelow(
				efficientElevator.floorsTraversed,
				requestOrderElevator.floorsTraversed,
			);
		});
	});
});

export default class Elevator {
	constructor() {
		this.currentFloor = 0;
		this.stops = 0;
		this.floorsTraversed = 0;
		this.requests = [];
		this.riders = [];
	}

	dispatch() {
		if (this.hasStop()) {
			this.processCurrentFloor(true);
		}

		let direction = this.getDispatchDirection();

		while (this.requests.length > 0 || this.riders.length > 0) {
			if (!this.hasPendingStopInDirection(direction)) {
				direction = direction === "up" ? "down" : "up";
			}

			if (!this.hasPendingStopInDirection(direction)) {
				break;
			}

			if (direction === "up") {
				this.moveUp();
			} else {
				this.moveDown();
			}

			this.processCurrentFloor();
		}

		if (this.checkReturnToLoby()) {
			this.returnToLoby();
		}
	}

	dispatchInRequestOrder() {
		const pendingRequests = [...this.requests];
		this.requests = [];

		while (pendingRequests.length > 0) {
			this.goToFloor(pendingRequests.shift());
		}
	}

	goToFloor(person, shouldCheckReturnToLoby = true) {
		if (!this.requests.includes(person) && !this.riders.includes(person)) {
			this.requests.push(person);
		}

		if (!this.riders.includes(person)) {
			this.travelToFloor(person.currentFloor);
			this.processCurrentFloor(true);
		}

		if (this.riders.includes(person)) {
			this.travelToFloor(person.dropOffFloor);
			this.processCurrentFloor(true);
		}

		if (shouldCheckReturnToLoby && this.checkReturnToLoby()) {
			this.returnToLoby();
		}
	}

	moveUp() {
		this.currentFloor++;
		this.floorsTraversed++;
		if (this.hasStop()) {
			this.stops++;
		}
	}

	moveDown() {
		if (this.currentFloor > 0) {
			this.currentFloor--;
			this.floorsTraversed++;
			if (this.hasStop()) {
				this.stops++;
			}
		}
	}

	hasStop() {
		return (
			this.requests.some((request) => request.currentFloor === this.currentFloor) ||
			this.riders.some((rider) => rider.dropOffFloor === this.currentFloor)
		);
	}

	hasPickup() {
		const pickups = this.requests.filter(
			(request) => request.currentFloor === this.currentFloor,
		);

		if (pickups.length === 0) {
			return false;
		}

		this.requests = this.requests.filter(
			(request) => request.currentFloor !== this.currentFloor,
		);
		this.riders.push(...pickups);

		return true;
	}

	hasDropoff() {
		const ridersBeforeDropoff = this.riders.length;

		this.riders = this.riders.filter(
			(rider) => rider.dropOffFloor !== this.currentFloor,
		);

		return this.riders.length !== ridersBeforeDropoff;
	}

	checkReturnToLoby() {
		return (
			this.currentFloor > 0 &&
			this.requests.length === 0 &&
			this.riders.length === 0 &&
			new Date().getHours() < 12
		);
	}

	returnToLoby() {
		while (this.currentFloor > 0) {
			this.moveDown();
		}
	}

	reset() {
		this.currentFloor = 0;
		this.stops = 0;
		this.floorsTraversed = 0;
		this.requests = [];
		this.riders = [];
	}

	processCurrentFloor(countStop = false) {
		const hadStop = this.hasStop();

		if (countStop && hadStop) {
			this.stops++;
		}

		this.hasDropoff();
		this.hasPickup();
	}

	travelToFloor(targetFloor) {
		while (this.currentFloor < targetFloor) {
			this.moveUp();
			this.processCurrentFloor();
		}

		while (this.currentFloor > targetFloor) {
			this.moveDown();
			this.processCurrentFloor();
		}
	}

	getDispatchDirection() {
		if (this.requests.length === 0) {
			return "up";
		}

		return this.requests[0].currentFloor >= this.currentFloor ? "up" : "down";
	}

	hasPendingStopInDirection(direction) {
		if (direction === "up") {
			return (
				this.requests.some((request) => request.currentFloor > this.currentFloor) ||
				this.riders.some((rider) => rider.dropOffFloor > this.currentFloor)
			);
		}

		return (
			this.requests.some((request) => request.currentFloor < this.currentFloor) ||
			this.riders.some((rider) => rider.dropOffFloor < this.currentFloor)
		);
	}

}

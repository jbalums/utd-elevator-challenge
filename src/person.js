export default class Person {
	constructor(name, currentFloor, dropOffFloor) {
		this.name = name;
		this.currentFloor = currentFloor;
		this.dropOffFloor = dropOffFloor;
	}

	requestFloor(floor) {
		this.dropOffFloor = floor;
	}
}

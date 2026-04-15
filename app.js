import Elevator from "./src/elevator.js";
import Person from "./src/person.js";

const FLOOR_COUNT = 10;
const STEP_DELAY_MS = 620;

const scenarioPresets = {
	"single-up": [{ name: "Brittany", currentFloor: 2, dropOffFloor: 5 }],
	"single-down": [{ name: "Brittany", currentFloor: 8, dropOffFloor: 3 }],
	"bob-sue": [
		{ name: "Bob", currentFloor: 3, dropOffFloor: 9 },
		{ name: "Sue", currentFloor: 6, dropOffFloor: 2 },
	],
	"mixed-pair": [
		{ name: "Jeanne", currentFloor: 7, dropOffFloor: 1 },
		{ name: "Karl", currentFloor: 2, dropOffFloor: 8 },
	],
};

class VisualElevator extends Elevator {
	constructor() {
		super();
		this.timeline = [];
	}

	record(type, message) {
		this.timeline.push({
			type,
			message,
			currentFloor: this.currentFloor,
			stops: this.stops,
			floorsTraversed: this.floorsTraversed,
			requests: this.requests.map(clonePerson),
			riders: this.riders.map(clonePerson),
		});
	}

	moveUp() {
		super.moveUp();
		this.record("move", `Moved up to floor ${this.currentFloor}.`);
	}

	moveDown() {
		super.moveDown();
		this.record("move", `Moved down to floor ${this.currentFloor}.`);
	}

	hasPickup() {
		const pickedUp = this.requests.filter(
			(request) => request.currentFloor === this.currentFloor,
		);
		const result = super.hasPickup();

		if (result) {
			this.record(
				"pickup",
				`Picked up ${pickedUp.map((person) => person.name).join(", ")} on floor ${this.currentFloor}.`,
			);
		}

		return result;
	}

	hasDropoff() {
		const droppedOff = this.riders.filter(
			(rider) => rider.dropOffFloor === this.currentFloor,
		);
		const result = super.hasDropoff();

		if (result) {
			this.record(
				"dropoff",
				`Dropped off ${droppedOff.map((person) => person.name).join(", ")} on floor ${this.currentFloor}.`,
			);
		}

		return result;
	}

	returnToLoby() {
		this.record("return", "No riders remain before noon, returning to the lobby.");
		super.returnToLoby();
	}
}

const shaftElement = document.querySelector("#shaft");
const carElement = document.querySelector("#elevator-car");
const carRidersElement = document.querySelector("#car-riders");
const queueListElement = document.querySelector("#queue-list");
const activeRequestsElement = document.querySelector("#active-requests");
const activityLogElement = document.querySelector("#activity-log");
const requestForm = document.querySelector("#request-form");
const runButton = document.querySelector("#run-button");
const clearButton = document.querySelector("#clear-button");

const metricFloor = document.querySelector("#metric-floor");
const metricStops = document.querySelector("#metric-stops");
const metricTraversed = document.querySelector("#metric-traversed");

let draftQueue = [...scenarioPresets["bob-sue"]];
let animationToken = 0;

buildFloors();
renderQueueDraft();
renderState(
	{
		currentFloor: 0,
		stops: 0,
		floorsTraversed: 0,
		requests: draftQueue.map((person) => ({ ...person })),
		riders: [],
		message: "Choose a scenario or press run to start the simulation.",
	},
	[{ message: "Choose a scenario or press run to start the simulation." }],
);

document.querySelectorAll(".scenario-button").forEach((button) => {
	button.addEventListener("click", () => {
		draftQueue = scenarioPresets[button.dataset.scenario].map((person) => ({
			...person,
		}));
		renderQueueDraft();
		runSimulation();
	});
});

requestForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const formData = new FormData(requestForm);
	const rider = {
		name: String(formData.get("name")).trim(),
		currentFloor: Number(formData.get("currentFloor")),
		dropOffFloor: Number(formData.get("dropOffFloor")),
	};

	if (!rider.name) {
		return;
	}

	draftQueue.push(rider);
	renderQueueDraft();
	requestForm.reset();
	document.querySelector("#current-floor-input").value = "0";
	document.querySelector("#dropoff-floor-input").value = "5";
});

runButton.addEventListener("click", () => {
	runSimulation();
});

clearButton.addEventListener("click", () => {
	draftQueue = [];
	animationToken += 1;
	renderQueueDraft();
	renderState(
		{
			currentFloor: 0,
			stops: 0,
			floorsTraversed: 0,
			requests: [],
			riders: [],
			message: "Queue cleared. Add riders or load a scenario.",
		},
		[{ message: "Queue cleared. Add riders or load a scenario." }],
	);
});

function buildFloors() {
	const markup = [];

	for (let floor = FLOOR_COUNT - 1; floor >= 0; floor -= 1) {
		markup.push(`
			<div class="floor-row" data-floor="${floor}">
				<div class="floor-number">${floor}</div>
				<div class="floor-people" data-floor-people="${floor}"></div>
			</div>
		`);
	}

	shaftElement.insertAdjacentHTML("afterbegin", markup.join(""));
}

function renderQueueDraft() {
	if (draftQueue.length === 0) {
		queueListElement.innerHTML = `<li class="queue-empty">No riders queued yet.</li>`;
		return;
	}

	queueListElement.innerHTML = draftQueue
		.map(
			(person, index) => `
				<li>
					<strong class="detail-name">${index + 1}. ${person.name}</strong>
					<div class="detail-meta">Floor ${person.currentFloor} to ${person.dropOffFloor}</div>
				</li>
			`,
		)
		.join("");
}

function runSimulation() {
	animationToken += 1;
	const token = animationToken;

	const elevator = new VisualElevator();
	elevator.requests = draftQueue.map(
		(person) => new Person(person.name, person.currentFloor, person.dropOffFloor),
	);
	elevator.record(
		"queued",
		elevator.requests.length === 0
			? "No riders queued."
			: `${elevator.requests.length} rider request(s) queued.`,
	);

	if (elevator.requests.length > 0) {
		elevator.dispatch();
		elevator.record("complete", "Simulation complete.");
	}

	playTimeline(elevator.timeline, token);
}

async function playTimeline(timeline, token) {
	if (timeline.length === 0) {
		return;
	}

	for (let index = 0; index < timeline.length; index += 1) {
		if (token !== animationToken) {
			return;
		}

		const snapshot = timeline[index];
		const visibleLog = timeline
			.slice(Math.max(0, index - 5), index + 1)
			.map((entry) => ({ message: entry.message }));

		renderState(snapshot, visibleLog);
		await wait(index === 0 ? 150 : STEP_DELAY_MS);
	}
}

function renderState(snapshot, logEntries) {
	metricFloor.textContent = String(snapshot.currentFloor);
	metricStops.textContent = String(snapshot.stops);
	metricTraversed.textContent = String(snapshot.floorsTraversed);

	carElement.style.setProperty(
		"--car-index",
		String(FLOOR_COUNT - 1 - snapshot.currentFloor),
	);

	document.querySelectorAll(".floor-row").forEach((row) => {
		const floor = Number(row.dataset.floor);
		row.classList.toggle("is-active", floor === snapshot.currentFloor);
		const floorPeopleElement = row.querySelector(".floor-people");
		const waitingPeople = snapshot.requests.filter(
			(request) => request.currentFloor === floor,
		);

		floorPeopleElement.innerHTML = waitingPeople
			.map(
				(person) =>
					`<span class="person-chip">${person.name} to ${person.dropOffFloor}</span>`,
			)
			.join("");
	});

	carRidersElement.innerHTML =
		snapshot.riders.length === 0
			? `<span class="person-chip">Empty</span>`
			: snapshot.riders
					.map(
						(person) =>
							`<span class="person-chip">${person.name} to ${person.dropOffFloor}</span>`,
					)
					.join("");

	activeRequestsElement.innerHTML =
		snapshot.requests.length === 0
			? `<li class="queue-empty">No pending requests.</li>`
			: snapshot.requests
					.map(
						(person) => `
							<li>
								<strong class="detail-name">${person.name}</strong>
								<div class="detail-meta">Waiting on floor ${person.currentFloor} for floor ${person.dropOffFloor}</div>
							</li>
						`,
					)
					.join("");

	activityLogElement.innerHTML = logEntries
		.filter((entry) => entry.message)
		.map((entry) => `<li>${entry.message}</li>`)
		.join("");
}

function clonePerson(person) {
	return {
		name: person.name,
		currentFloor: person.currentFloor,
		dropOffFloor: person.dropOffFloor,
	};
}

function wait(duration) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, duration);
	});
}

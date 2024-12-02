let guessText = "";
let interval = [1, 1, 2, 3, 4, 5];
let duration = [1, 2, 4, 7, 11, 16];
let gameSeed;
let maxAttempts = 6;
let attempt = 0;
let attemptElements = [];
let songTitles;

let gameSplash;
let splashDate;

let attemptParent;

let chosenSong;
let songIndex;
let audio;

function initializeBandle() {
	gameSplash = document.getElementById("splash");
	splashDate = document.getElementById("splash-date");
	window.DTGCore = new DTGameCore(gameSplash, splashDate);

	attemptParent = document.getElementById("attempt-parent");
	songTitles = songs.map((s) => s.name);

	gameSeed = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());

	chosenSong = DTGCore.randomArrayElement(songs);
    if (chosenSong == null) return;
    audio = new Audio(chosenSong.path);
	songIndex = songTitles.indexOf(chosenSong.name ?? "");

	generateAttemptElements();

	console.log("Bandle Initialized");
}

function generateAttemptElements() {
	for (let i = 0; i < 6; i++) {
		let mainElement = document.createElement("div");
		mainElement.classList.add("attempt");
		let guessText = document.createElement("div");
		let guessInfo = document.createElement("div");
		guessInfo.classList.add("guess-info");
		guessInfo.innerText = `${i + 1}.`;
		mainElement.appendChild(guessText);
		mainElement.appendChild(guessInfo);
		attemptParent.appendChild(mainElement);

		attemptElements.push({
			main: mainElement,
			text: guessText,
			info: guessInfo,
		});
	}
}

function startGame() {
	DTGCore.hideSplashScreen();
}

function playSong() {}


initializeBandle();
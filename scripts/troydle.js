let guessText = "";
let interval = [1, 1, 2, 3, 4, 5];
let duration = [1, 2, 4, 7, 11, 16];
let gameSeed;
let maxAttempts = 6;
let attempt = 0;
let attemptElements = [];
let songTitles;
let remainingAttemptsElement;
let progressBar;
let searchResultWrapper;
let textInput;
let submitButton;
let selectedSearch = -1;
let gameFinished = false;

let attemptResults = [];

let selectedGuess = false;

let fuseSearch;

let songCurrentTime;

let attemptOverlayElements = [];

let gameSplash;
let splashDate;

let attemptParent;

let chosenSong;
let songIndex;
let audio;

function initializeTroydle() {
	gameSplash = document.getElementById("splash");
	splashDate = document.getElementById("splash-date");
	window.DTGCore = new DTGameCore(gameSplash, splashDate);

	attemptParent = document.getElementById("attempt-parent");
	progressBar = document.getElementById("progress-bar");
	songCurrentTime = document.getElementById("song-current-time");
	remainingAttemptsElement = document.getElementById("song-attempts-remaining");
	searchResultWrapper = document.getElementById("search-results");
	textInput = document.getElementById("text-input");
	submitButton = document.getElementById("submit-button");
	songTitles = songs.map((s) => s.name);
	fuseSearch = new Fuse(songTitles, { includeScore: true, threshold: 0.3 });

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

	let savedDate = loadData("troydle-today");
	if (savedDate != null && savedDate.date == gameSeed) {
		attempt = savedDate.attempt;
		attemptResults = savedDate.attemptResults;
		gameFinished = savedDate.complete;
		won = savedDate.won;
		if (gameFinished) {
			disableGameplay();
			setupModalUI(won);
		}
	}

	for (let i = 1; i < 6; i++) {
		attemptOverlayElements.push(
			document.getElementById(`attempt-overlay-${i}`)
		);
	}
	updateUIWithAttempt();

	console.log("Troydle Initialized");
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

let won = false;
function submitOrSkip() {
	won = songIndex == selectedSearch;
	if (guessText == "" || !selectedGuess) {
		attemptResults.push({ title: "Skipped", result: false });
	} else {
		attemptResults.push({ title: guessText, result: won });
	}
	selectedSearch = -1;
	selectedGuess = false;

	textInput.value = "";
	guessText = "";
	searchResultWrapper.classList.add("hidden");
	resetProgressBar();
	updateUIWithAttempt();

	if (won || attempt >= maxAttempts) {
		saveGameToHistory();
		gameEnd();
		return;
	}
	attempt++;
	if (attempt >= maxAttempts) {
		won = false;
		saveGameToHistory();
		gameEnd();
	}
	updateUIWithAttempt();
	saveGameProgress();
}

function gameEnd() {
	gameFinished = true;
	disableGameplay();
	document.getElementById("result-modal").classList.add("modal-visible");
	saveGameProgress();
	setupModalUI(won);
	audio.currentTime = 0;
}

function toggleModalSong() {
	if (audio.paused) {
		audio.play();
		document
			.getElementById("modal-player-icon")
			.classList.remove("ti-player-play-filled");
		document
			.getElementById("modal-player-icon")
			.classList.add("ti-player-pause-filled");
	} else {
		audio.pause();
		document
			.getElementById("modal-player-icon")
			.classList.add("ti-player-play-filled");
		document
			.getElementById("modal-player-icon")
			.classList.remove("ti-player-pause-filled");
	}
}

function saveGameProgress() {
	let gameObject = {
		attempt: attempt,
		attemptResults: attemptResults,
		complete: gameFinished,
		won: won,
		date: gameSeed,
	};
	saveData("troydle-today", gameObject);
	console.log("Game Progress Saved");
}

function saveGameToHistory() {
	let history = loadData("troydle-history") ?? [];
	history.push({ date: gameSeed, won: won, attempt: attempt });
	saveData("troydle-history", history);
}

function saveData(id, data) {
	localStorage.setItem(id, JSON.stringify(data));
}

function loadData(id) {
	return JSON.parse(localStorage.getItem(id));
}

function disableGameplay() {
	document.getElementById("game-tagline").innerHTML =
		"You've already played today!";
	document.getElementById("game-action-button").innerHTML = "View Results";
	document.getElementById("bottom-content").classList.add("hidden");
	document.getElementById("view-results-button").classList.remove("hidden");
}
function viewResults() {
	document.getElementById("result-modal").classList.add("modal-visible");
}
function viewGame() {
	document.getElementById("result-modal").classList.remove("modal-visible");
}
let completeCopyFormat =
	"I solved today's Troydle in {0} second{1}!\n{2}\n{3}\n{4}";
let failCopyFormat = "I couldn't solve today's Troydle, can you?\n{0}\n{1}";
let redSquare = "🟥";
let whiteSquare = "⬜";

function externalRedirect() {
	// Redirect to the song's Spotify page
	if (chosenSong.url) {
		window.open(chosenSong.url, "_blank");
	} else {
		DTGCore.showToast("Something went wrong.", "ti-x");
	}
}

function copyResultsString() {
	if (mobileCheck()) {
		navigator.share({
			text: resultShareString(),
			url: window.location.href,
		});
	} else {
		DTGCore.showToast("Results copied to clipboard!", "ti-clipboard");
		DTGCore.copyToClipboard(resultShareString());
	}
}
const mobileCheck = function () {
	let check = false;
	(function (a) {
		if (
			/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
				a
			) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
				a.substr(0, 4)
			)
		)
			check = true;
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

function resultShareString() {
	let dateString = new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date());
	if (won) {
		let emojiString = redSquare;
		for (let i = 0; i < attempt; i++) {
			emojiString += redSquare;
		}
		for (let i = 0; i < maxAttempts - attempt - 1; i++) {
			emojiString += whiteSquare;
		}

		return DTGCore.formatString(
			completeCopyFormat,
			duration[attempt],
			attempt > 0 ? "s" : "",
			dateString,
			emojiString,
			window.location.href
		);
	} else {
		return DTGCore.formatString(
			failCopyFormat,
			dateString,
			window.location.href
		);
	}
}

function setupModalUI(won) {
	if (won) {
		document.getElementById("modal-title").innerText = "Good job!";
	} else {
		document.getElementById("modal-title").innerText = "Better luck next time.";
	}
	document.getElementById("song-title").innerText = songTitles[songIndex];
	let stats = calculateStatHistory();
	document.getElementById("total-wins").innerText = stats.totalWins;
	document.getElementById("total-plays").innerText = stats.totalPlays;
	document.getElementById("daily-streak").innerText = stats.dailyStreak;
	document.getElementById("win-streak").innerText = stats.winStreak;
}

function calculateStatHistory() {
	let history = loadData("troydle-history");
	if (history == null)
		return { totalWins: 0, totalPlays: 0, dailyStreak: 0, winStreak: 0 };
	let totalWins = history.map((h) => h.won).filter((w) => w).length;
	let totalPlays = history.length;
	let winStreak = 0;
	let dailyStreak = 0;

	//first, to calculate the daily streak we need to identify how many consecutive dates
	//are in the history array
	let testDateArray = ["11/01/2024", "12/01/2024", "12/02/2024", "12/03/2024"];
	let dateArray = history.map((h) => h.date);
	// dateArray = testDateArray

	//starting at the last array element (which is the most recent record) we need to decrement and see if each is different by a day
	//if it is, we increment the daily streak
	let streak = 0;
	let lastDate = dateArray[dateArray.length - 1];

	if (new Date(lastDate).day == new Date().day) {
		streak++; //streak starts today, so we can increment. the streak can only really start today
		for (let i = dateArray.length - 2; i >= 0; i--) {
			let currentDate = dateArray[i];
			let lastDateObject = new Date(lastDate);
			let currentDateObject = new Date(currentDate);
			let difference = lastDateObject - currentDateObject;
			if (difference == 86400000) {
				streak++;
				lastDate = currentDate;
			} else {
				break;
			}
		}
	}
	dailyStreak = streak;
	//now we need to calculate the win streak
	if (history[history.length - 1].won) {
		streak = 1;
		for (let i = history.length - 2; i >= 0; i--) {
			if (history[i].won) {
				streak++;
			} else {
				break;
			}
		}
		winStreak = streak;
	}
	return { totalWins, totalPlays, dailyStreak, winStreak };
}

function updateUIWithAttempt() {
	remainingAttemptsElement.innerText = `${maxAttempts - attempt} attempt${
		maxAttempts - attempt != 1 ? "s" : ""
	} remaining`;
	for (let i = 0; i < 5; i++) {
		if (i < attempt) {
			attemptOverlayElements[i].classList.remove("disabled");
		} else {
			attemptOverlayElements[i].classList.add("disabled");
		}
	}
	submitButton.disabled = !selectedGuess && guessText != "";
	if (guessText != "") {
		submitButton.innerText = "Submit";
	} else {
		submitButton.innerText = `Skip`;
	}

	attemptResults.forEach((result, idx) => {
		attemptElements[idx].text.innerText = result.title;
		attemptElements[idx].info.innerHTML = result.result
			? `<i class="ti ti-check"/>`
			: `<i class="ti ti-x"/>`;
	});
}

function startGame() {
	DTGCore.hideSplashScreen();
	if (gameFinished) {
		document.getElementById("result-modal").classList.add("modal-visible");
	}
}
function playSong() {
	audio.pause();
	audio.currentTime = 0;
	audio.play();
	setProgressBar();
	startTimeProgress();
	setTimeout(() => {
		audio.pause();
	}, duration[attempt] * 1000);
}

let secondsElapsed = 0;
let progressInterval;

function startTimeProgress() {
	clearInterval(progressInterval);
	secondsElapsed = 0;
	songCurrentTime.innerText = "0:00";
	progressInterval = setTimeout(() => {
		incrementTime();
	}, 500);
}

function incrementTime() {
	secondsElapsed++;
	songCurrentTime.innerText = `0:${
		secondsElapsed < 10 ? "0" : ""
	}${secondsElapsed}`;
	if (secondsElapsed >= duration[attempt]) {
		clearInterval(progressInterval);
		return;
	}

	progressInterval = setTimeout(() => {
		incrementTime();
	}, 1000);
}

function onInput(e, el) {
	selectedGuess = false;
	guessText = el.value;
	if (guessText.length > 0) {
		searchResultWrapper.classList.remove("hidden");
	} else {
		searchResultWrapper.classList.add("hidden");
	}
	let results = fuseSearch.search(guessText, { includeScore: true });
	searchResultWrapper.innerHTML = "";
	results.forEach((result) => {
		let resultElement = document.createElement("button");
		resultElement.innerText = result.item;
		resultElement.onclick = () => {
			selectGuess(result.refIndex);
		};
		searchResultWrapper.appendChild(resultElement);
	});
	updateUIWithAttempt();
}

function selectGuess(idx) {
	selectedGuess = true;
	selectedSearch = idx;
	let guess = songTitles[idx];
	guessText = guess;
	textInput.value = guess;
	searchResultWrapper.classList.add("hidden");
	updateUIWithAttempt();
}

function resetProgressBar() {
	progressBar.style.transitionDuration = "0s";
	progressBar.style.setProperty("--progressBarProgress", "0");
}

function setProgressBar() {
	resetProgressBar();
	setTimeout(() => {
		progressBar.style.transitionDuration = `${duration[attempt]}s`;
		progressBar.style.setProperty("--progressBarProgress", duration[attempt]);
	}, 1);
}

initializeTroydle();

<script lang="ts">
	import { fade } from "svelte/transition";
	import { tweened } from "svelte/motion";
	import { IconX, IconCheck, IconPlayerPlayFilled } from "@tabler/icons-svelte";
	import { linear } from "svelte/easing";
	import Music from "$lib/assets/music.json";
	import { onMount } from "svelte";
	import random from "random";
	import Fuse from "fuse.js";
	let songs: { name: string; path: string }[] = Music.songs;
	let songTitles = songs.map((s) => s.name);
	let guessText = "";
	let interval = [1, 1, 2, 3, 4, 5];
	let duration = [1, 2, 4, 7, 11, 16];
	const date = new Date();
	const seed = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
	random.use(seed);

	let chosenSong: { name: string; path: string } | undefined =
		random.choice(songs);
	let songIndex = songTitles.indexOf(chosenSong?.name ?? "");
	console.log(songTitles);
	const fuse = new Fuse(songTitles);
	let audio: HTMLAudioElement;

	let won = false;

	let progressBarProgress = tweened(0, { duration: 1000, easing: linear });
	let playing = true;
	let attempt = 0;
	let maxAttempts = 6;
	let guesses: { guess: string; result: Boolean | null }[] = new Array(
		maxAttempts
	);
	guesses = guesses.fill({ guess: "", result: null });

	let searchSelected = false;
	let searchResults: any[] = [];
	let selectedSearch = -1;

	function input() {
		searchSelected = false;
		searchResults = fuse.search(guessText);
		console.log(searchResults);
	}

	function selectGuess(index: number) {
		selectedSearch = index;
		guessText = songTitles[index];
		searchSelected = true;
	}

	let showModal = false;

	function submitGuess() {
		won = selectedSearch == songIndex;
		guesses[attempt] = {
			guess: guessText,
			result: won,
		};
		if(won) {
			showModal = true;
			audio.play();
			return;
		}
		selectedSearch = -1;
		searchSelected = false;
		attempt++;
		if(attempt == maxAttempts) {
			showModal = true;
			audio.play();
			won = false;
		}
		guessText = "";
		progressBarProgress.set(0, { duration: 0 });
	}
	function playClip() {
		progressBarProgress.set(0, { duration: 0 });
		progressBarProgress.set(duration[attempt], {
			duration: duration[attempt] * 1000,
		});
		audio.currentTime = 0;
		audio.play();

		setTimeout(() => {
			audio.pause();
		}, duration[attempt] * 1000);
	}

	onMount(() => {
		if (chosenSong == null) return;
		audio = new Audio(chosenSong.path);
	});
</script>

{#if !playing}
	<div class="splash-wrapper" transition:fade>
		<h1>Bandle</h1>
		<p>Guess the song played by the USC Marching band</p>
		<div class="flex-hor">
			<button>Back</button>
			<button
				on:click={() => {
					playing = true;
				}}>Play</button
			>
		</div>
	</div>
{/if}
<div class="game-wrapper">
	<div class="top-content">
		<h1>Bandle</h1>
		<div class="song-bar">
			<div
				class="song-progress"
				style:width={`min(calc(${($progressBarProgress * 100) / 16}% + ${3 * (-8 * Math.pow($progressBarProgress / 16 - 0.5, 2) + 2)}px), 100%)`}
			></div>
			<div class="overlay">
				<div class="overlay-1s"></div>
				<div class="overlay-1s" class:disabled={attempt < 1}></div>
				<div class="overlay-2s" class:disabled={attempt < 2}></div>
				<div class="overlay-3s" class:disabled={attempt < 3}></div>
				<div class="overlay-4s" class:disabled={attempt < 4}></div>
				<div class="overlay-5s" class:disabled={attempt < 5}></div>
			</div>
		</div>
		<div class="song-details">
			<div class="song-time">
				0:{Math.round($progressBarProgress).toLocaleString("en-US", {
					minimumIntegerDigits: 2,
					useGrouping: false,
				})}
			</div>
			<div class="song-attempts">{maxAttempts - attempt} attempts left</div>
			<div class="song-time">0:16</div>
		</div>
	</div>
	<div class="fill-scroll">
		<div class="attempts">
			{#each { length: maxAttempts } as _, i}
				<div class="attempt" class:active={attempt == i}>
					<div>{guesses[i].guess}</div>
					<div class="guess-info">
						{#if guesses[i].result == null}
							{i + 1}
						{:else if !guesses[i].result}
							<IconX color="var(--cardinal)"></IconX>
						{:else if guesses[i].result}
							<IconCheck color="green"></IconCheck>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="bottom-content">
		{#if searchResults.length > 0 && !searchSelected && guessText != ""}
			<div class="search-results">
				{#each {length: Math.min(searchResults.length, 7)} as _, i}
					<button
						on:click={() => {
							selectGuess(searchResults[i].refIndex);
						}}>{searchResults[i].item}</button
					>
				{/each}
			</div>
		{/if}
		<div class="bottom-content-background"></div>
		<button class="play" on:click={playClip}><IconPlayerPlayFilled /></button>
		<div class="type-bar">
			<input type="text" bind:value={guessText} placeholder="Write your guess here!" on:input={input} />
			<button on:click={submitGuess} disabled={guessText != "" && !searchSelected}>
				{#if guessText != ""}
					Submit
				{:else if attempt + 1 < maxAttempts}
					Skip (+{interval[attempt + 1]}s)
				{:else}
					Give Up
				{/if}
			</button>
		</div>
	</div>
</div>
{#if showModal}
<div class="modal-wrapper" transition:fade>
	<div class="modal-content">
		{#if won}
		<h1>Great job!</h1>
		<p>You guessed the song in {duration[attempt]} second{duration[attempt] > 1 ? "s":""}!</p>
		{:else} 
		<h1>Better luck next time.</h1>
		{/if}
		<h2>{songTitles[songIndex]}</h2>
	</div>
</div>
{/if}

<style>
	.splash-wrapper {
		background: rgb(188, 188, 188);
	}
	h1, h2, p {
		width: 100%;
		text-align: center;
	}
	.game-wrapper {
		width: 100%;
		height: 100%;
		padding-top: 30px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-sizing: border-box;
	}
	.song-bar {
		width: 100%;
		height: 40px;
		background: rgb(226, 226, 226);
		border-radius: 4px;
		margin-bottom: 15px;
		position: relative;
	}
	.song-progress {
		position: absolute;
		height: 100%;
		background: var(--cardinal);
		top: 0;
	}
	.overlay {
		display: flex;
		gap: 4px;
		width: 100%;
		height: 100%;
		justify-content: space-between;
		position: absolute;
		top: 0;
	}
	.overlay * {
		height: 100%;
		outline: 4px solid white;
		border-radius: 4px;
		transition: background 0.3s;
	}
	.overlay *.disabled {
		background: rgba(255, 255, 255, 0.75);
	}
	.overlay-1s {
		width: calc(1 / 16 * 100%);
	}
	.overlay-2s {
		width: calc(2 / 16 * 100%);
	}
	.overlay-3s {
		width: calc(3 / 16 * 100%);
	}
	.overlay-4s {
		width: calc(4 / 16 * 100%);
	}
	.overlay-5s {
		width: calc(5 / 16 * 100%);
	}
	.song-details {
		font-family: monospace;
		display: flex;
		justify-content: space-between;
	}
	.attempts {
		width: inherit;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 15px 0;
	}
	.attempt {
		border: 1px solid lightgray;
		box-sizing: border-box;
		border-radius: 4px;
		height: 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 10px;
		padding-right: 7px;
		font-family: serif;
		font-size: 16px;
		transition: border 0.3s;
	}
	.attempt * {
		height: fit-content;
	}
	.active {
		border: 1px solid rgb(0, 0, 0);
	}
	.type-bar {
		width: 100%;
		display: flex;
		gap: 10px;
	}
	.type-bar input {
		width: 100%;
		border: 1px solid rgb(158, 158, 158);
		box-sizing: border-box;
		border-radius: 4px;
		height: 40px;
		padding: 0 10px;
	}
	button.play {
		width: 60px;
		border: none;
		background: var(--cardinal);
		color: white;
		font-family: serif;
		border-radius: 100%;
		font-size: 16px;
		height: 60px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.type-bar button {
		width: 100px;
		border: none;
		background: var(--cardinal);
		color: white;
		font-family: serif;
		border-radius: 4px;
		font-size: 16px;
		height: 40px;
		cursor: pointer;
	}
	.type-bar button:disabled {
		background: rgb(134, 134, 134);
		cursor: not-allowed;
	}
	.top-content {
		flex-shrink: 0;
	}
	.fill-scroll {
		flex-grow: 1;
		flex-shrink: 1;
		overflow-y: auto;
	}
	.bottom-content {
		width: 100%;
		position: relative;
		height: 180px;
		flex-shrink: 0;
		padding-top: 15px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
	.bottom-content-background {
		width: 100vw;
		height: 100%;
		position: absolute;
		background: rgb(238, 238, 238);
		border-top: 1px solid rgb(158, 158, 158);
		top: 0;
		left: calc(-1 * 0.5 * (100vw - min(calc(100vw - 80px), 600px)));
		z-index: -100;
	}
	.guess-info {
		color: gray;
		display: flex;
		width: 24px;
		height: 24px;
		justify-content: center;
		align-items: center;
	}
	.search-results {
		position: absolute;
		width: 100%;
		bottom: 179px;
		display: flex;
		flex-direction: column;
		border: 1px solid gray;
		border-bottom: 0;
	}
	.search-results button {
		background: rgb(238, 238, 238);
		border: none;
		height: 40px;
		font-size: 18px;
		font-family: serif;
		text-align: left;
		border-bottom: 1px solid gray;
	}
	.search-results button:hover {
		background: rgb(207, 207, 207);
	}
</style>

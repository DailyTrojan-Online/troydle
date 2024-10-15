<script lang="ts">
	import { fade } from "svelte/transition";
    import { tweened } from "svelte/motion";
    import {IconX, IconCheck, IconPlayerPlayFilled} from "@tabler/icons-svelte";
	import { linear } from "svelte/easing";

    let progressBarProgress = tweened(0, {duration: 1000, easing: linear})
	let playing = true;
	let attempt = 0;
	let maxAttempts = 6;
	let guesses: { guess: string; result: Boolean | null }[] = new Array(
		maxAttempts
	);
	guesses = guesses.fill({ guess: "", result: null });

	let guessText = "";
    let guessReset = "";
    let interval = [1, 1, 2, 3, 4, 5];
    let duration = [1, 2, 4, 7, 11, 16]
	function submitGuess() {
		guesses[attempt] = {
			guess: guessText,
			result: false,
		};
		attempt++;
        guessText = ""
	}
    function playClip() {
        progressBarProgress.set(0, {duration: 0})
        progressBarProgress.set(duration[attempt], {duration: duration[attempt] * 1000});
    }
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
            <div class="song-progress" style:width={`${$progressBarProgress * 100 / 16}%`}></div>
            <div class="overlay">
                <div class="overlay-1s" ></div>
                <div class="overlay-1s"class:disabled={attempt < 1}></div>
                <div class="overlay-2s"class:disabled={attempt < 2}></div>
                <div class="overlay-3s"class:disabled={attempt < 3}></div>
                <div class="overlay-4s"class:disabled={attempt < 4}></div>
                <div class="overlay-5s"class:disabled={attempt < 5}></div>
            </div>
        </div>
		<div class="song-details">
			<div class="song-time">0:{Math.round($progressBarProgress).toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
              })}</div>
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
		<div class="bottom-content-background"></div>
        <button class="play" on:click={playClip}><IconPlayerPlayFilled/></button>
		<div class="type-bar">
			<input type="text" bind:value={guessText} />
			<button on:click={submitGuess}>Submit</button>
		</div>
	</div>
</div>

<style>
	.splash-wrapper {
		background: rgb(188, 188, 188);
	}
	h1 {
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
</style>

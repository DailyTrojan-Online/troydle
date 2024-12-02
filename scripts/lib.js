function processSeed(seed) {
	if (seed === void 0) {
		seed = crypto.randomUUID();
	}
	if (typeof seed === "number") {
		return seed;
	}
	const strSeed = `${seed}`;
	let s = 0;
	for (let k = 0; k < strSeed.length; ++k) {
		s ^= strSeed.charCodeAt(k) | 0;
	}
	return s;
}

function mixKey(seed, key) {
	var _a;
	const seedStr = `${seed}`;
	let smear = 0;
	let j = 0;
	while (j < seedStr.length) {
		key[255 & j] =
			255 &
			((smear ^= ((_a = key[255 & j]) != null ? _a : 0) * 19) +
				seedStr.charCodeAt(j++));
	}
	if (!key.length) {
		return [0];
	}
	return key;
}

var _arc4_startdenom = 281474976710656;
var _arc4_significance = 4503599627370496;
var _arc4_overflow = 9007199254740992;

var ARC4RNG = class _ARC4RNG {
	constructor(seed) {
		const s = processSeed(seed);
		this._seed = s;
		const key = mixKey(s, []);
		const S = [];
		const keylen = key.length;
		this.i = 0;
		this.j = 0;
		this.S = S;
		let i = 0;
		while (i <= 255) {
			S[i] = i++;
		}
		for (let i2 = 0, j = 0; i2 <= 255; i2++) {
			const t = S[i2];
			j = 255 & (j + key[i2 % keylen] + t);
			S[i2] = S[j];
			S[j] = t;
		}
		this.g(256);
	}
	get name() {
		return "arc4";
	}
	next() {
		let n = this.g(6);
		let d = _arc4_startdenom;
		let x = 0;
		while (n < _arc4_significance) {
			n = (n + x) * 256;
			d *= 256;
			x = this.g(1);
		}
		while (n >= _arc4_overflow) {
			n /= 2;
			d /= 2;
			x >>>= 1;
		}
		return (n + x) / d;
	}
	g(count) {
		const { S } = this;
		let { i, j } = this;
		let r = 0;
		while (count--) {
			i = 255 & (i + 1);
			const t = S[i];
			S[j] = t;
			j = 255 & (j + t);
			S[i] = S[j];
			r = r * 256 + S[255 & (S[i] + t)];
		}
		this.i = i;
		this.j = j;
		return r;
	}
	clone() {
		return new _ARC4RNG(this._seed);
	}
};

class DTGameCore {
	constructor(gameSplash = null, splashDate = null) {
		this.rng = null;
		this.gameSplash = gameSplash;
		this.splashDate = splashDate;
		this.gameSeed = new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(new Date());
		this.initRNG(gameSeed);

		if (this.splashDate != null) {
			this.splashDate.innerText = new Intl.DateTimeFormat("en-US", {
				month: "long",
				day: "2-digit",
				year: "numeric",
			}).format(new Date());
		}
		console.log("Daily Trojan GameCore Initialized");
	}

	initRNG(seed) {
		this.rng = new ARC4RNG(seed);
	}

	homeRedirect() {
		this.redirect("https://dailytrojan.com/");
	}

	back() {
		this.redirect("../");
	}

	redirect(url) {
		window.location.href = url;
	}

	hideSplashScreen() {
        if(this.gameSplash == null) return;
		this.gameSplash.classList.add("game-splash-hidden");
	}

	randomArrayElement(arr) {
		const l = arr.length;
		const i = Math.floor(this.rng.next() * l);
		return arr[i];
	}
}

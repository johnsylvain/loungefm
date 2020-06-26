if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  navigator.serviceWorker.register('./service-worker.js')
}

const domElements = {
  body: document.querySelector('body'),
  toggle: document.querySelector("#toggle"),
  volume: document.querySelector("#volume"),
  audio: document.querySelector("#audio"),
  song: document.querySelector("#song"),
  artist: document.querySelector("#artist"),
  listeners: document.querySelector("#listeners"),
  animation: document.querySelector("#animation"),
  cycle: document.querySelector("#cycle"),
  player: document.querySelector(".player"),
  description: document.querySelector("#description"),
};

const appState = {
  isPlaying: false,
  isLoading: true,
};

const interval = (callback, timeout) => {
  let id;

  function loop() {
    id = setTimeout(loop, timeout);
    callback();
  }

  loop();

  return () => clearTimeout(id);
};

const fetch = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const response = () => ({
      text: () => Promise.resolve(request.responseText),
      json: () => Promise.resolve(request.responseText).then(JSON.parse),
    });
    request.open(options.method || "get", url, true);
    request.onload = () => resolve(response());
    request.onerror = reject;
    request.send(options.body || null);
  });
};

const poll = (url, timeout, cb) => {
  let stop;

  const fn = async () => {
    try {
      const blob = await fetch(url);
      const json = await blob.json();
      cb(json);
    } catch (e) {
      stop();
    }
  };

  stop = interval(fn, timeout);
};

function findUrls(text) {
  const reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)(?:[\.\!\/\\\w]*))?)/g;
  if (text.indexOf('<script') > -1) return '';
  return text.replace(reg, match => {
    const url = match.replace('</span>', String.empty);
    return `<a href="${url}" rel="noopener" target="_blank">${match}</a>`;
  });
}

const createAnimationMachine = () => ({
  unsubscribe: undefined,
  animations: {},
  register: function (name, fn) {
    this.animations[name] = fn;
  },
  trigger: function (name, data) {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = this.animations[name](data);
  },
});

const musicPlayerAnimations = createAnimationMachine();
const asciiAnimations = createAnimationMachine();

function animateLoading() {
  let i = 0;
  const flipFrames = ["-", "\\", "|", "/"];

  function renderLoadingBar(i) {
    const text = " Loading Stream ";
    const bar = "░".repeat(20);
    const position = bar.length - (i % (5 + bar.length + text.length));
    return (
      bar.substring(0, position) +
      text.substring(Math.abs(Math.min(0, position)))
    )
      .substring(0, 20)
      .padEnd(20, "░");
  }

  return interval(() => {
    domElements.volume.textContent = renderLoadingBar(i);
    domElements.toggle.textContent = flipFrames[i % flipFrames.length];
    domElements.body.classList.add('loading-cursor')
    i++;
  }, 150);
}

function animateSound({ analyser, frequencyData }) {
  domElements.toggle.textContent = "❙❙";
  domElements.body.classList.remove('loading-cursor')

  function renderVolumeMeter(value = 0) {
    const length = 20;
    const percent = value / 100;
    const clamped = percent > 1 ? 1 : percent;
    return "█".repeat(Math.floor(clamped * length)).padEnd(20, "░");
  }

  function loop() {
    requestAnimationFrame(loop);
    analyser.getByteFrequencyData(frequencyData);
    const numberOfBands = 1;
    const bandWidth = Math.floor(1024 / numberOfBands);
    const bands = Array.from({ length: numberOfBands })
      .map((_, i) => frequencyData.slice(i * bandWidth, (i + 1) * bandWidth))
      .map((data) => data.reduce((a, c) => a + c, 0) / bandWidth)
      .reduce((res, band) => res + renderVolumeMeter(band), "");
    domElements.volume.textContent = bands;
  }
  loop();
  return function () { };
}

musicPlayerAnimations.register("loading", animateLoading);
musicPlayerAnimations.register("analyse", animateSound);
asciiAnimations.register("play", (frames) => {
  let frame = 0;
  domElements.animation.textContent = frames[0];
  return interval(() => {
    frame = (frame + 1) % frames.length;
    domElements.animation.textContent = frames[frame];
  }, 500);
});

function createAnalyser($audio) {
  const context = new (typeof window.webkitAudioContext !== "undefined"
    ? window.webkitAudioContext
    : window.AudioContext)();
  const audioSrc = context.createMediaElementSource($audio);
  const analyser = context.createAnalyser();
  audioSrc.connect(analyser);
  analyser.connect(context.destination);
  return analyser;
}

function analyseAudio($audio) {
  const analyser = createAnalyser($audio);
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);

  const id = setInterval(() => {
    analyser.getByteFrequencyData(frequencyData);
    const sum = frequencyData.reduce((a, c) => a + c, 0);
    if (sum > 0) {
      clearInterval(id);
      musicPlayerAnimations.trigger("analyse", { analyser, frequencyData });
    }
  }, 1000);
}

domElements.volume.textContent = "░".repeat(20);

domElements.toggle.addEventListener("click", () => {
  appState.isPlaying = !appState.isPlaying;

  if (appState.isPlaying) {
    if (!domElements.audio.getAttribute("src")) {
      domElements.audio.setAttribute("src", "/stream");
    }
    if (appState.isLoading) {
      appState.isLoading = false;
      musicPlayerAnimations.trigger("loading");
      analyseAudio(domElements.audio);
    }
    domElements.audio.play();
    domElements.toggle.textContent = "❙❙";
  } else {
    domElements.audio.pause();
    domElements.toggle.textContent = "▶";
  }
});

const urls = [
  require("./scenes/bubbles.txt"),
  require("./scenes/floppy.txt"),
  require("./scenes/island2.txt"),
  require("./scenes/computer.txt"),
  require("./scenes/lady.txt"),
];

const map = (url) => fetch(url).then((r) => r.text());

Promise.all(urls.map(map)).then((s) => {
  let scene = window.localStorage.getItem("scene") || 0;
  const scenes = s.map((s) =>
    s.split("<<<FRAME>>>").map((f) => f.split("\n").slice(1).join("\n"))
  );

  domElements.cycle.addEventListener("click", () => {
    scene = (parseInt(scene) + 1) % scenes.length;
    window.localStorage.setItem("scene", scene);
    asciiAnimations.trigger("play", scenes[scene]);
  });

  asciiAnimations.trigger("play", scenes[scene]);
}).catch(err => {
  domElements.player.style.opacity = 0.5;
  domElements.player.style.pointerEvents = 'none';
  domElements.animation.textContent = 'Please connect to the internet.'
});

poll("/api", 7000, (data) => {
  domElements.song.textContent = data.title;
  domElements.artist.textContent = data.artist;
  domElements.listeners.textContent = `listeners: ${data.listeners}`;
  domElements.description.innerHTML = findUrls(data.description || '');
  const title = `Lounge FM - ${data.title} - ${data.artist}`;
  if (document.title !== title) {
    document.title = title;
  }
});

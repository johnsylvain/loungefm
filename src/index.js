import { animate, poll } from "./util";

const $toggle = document.querySelector("#toggle");
const $volume = document.querySelector("#volume");
const $audio = document.querySelector("#audio");
const $song = document.querySelector("#song");
const $artist = document.querySelector("#artist");
const $listeners = document.querySelector("#listeners");

const animations = {
  unsubscribe: undefined,
  animations: {},
  register: function (name, a) {
    this.animations[name] = a;
  },
  trigger: function (name, data) {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = this.animations[name](data);
  },
};

function animateLoading() {
  let i = 0;
  const flipFrames = ["-", "\\", "|", "/"]

  return animate(() => {
    $volume.textContent = renderLoadingBar(i);
    $toggle.textContent = flipFrames[i % flipFrames.length]
    $toggle.disabled = true;
    i++;
  }, 150);
}

function animateSound({ analyser, frequencyData }) {
  $toggle.textContent = "❙❙";
  $toggle.disabled = false;
  function loop() {
    requestAnimationFrame(loop);
    analyser.getByteFrequencyData(frequencyData);
    const numberOfBands = 1;
    const bandWidth = Math.floor(1024 / numberOfBands);
    const bands = Array.from({ length: numberOfBands })
      .map((_, i) => frequencyData.slice(i * bandWidth, (i + 1) * bandWidth))
      .map((data) => data.reduce((a, c) => a + c, 0) / bandWidth)
      .reduce((res, band) => res + renderVolumeMeter(band, "horizontal"), "");
    $volume.textContent = bands;
  }
  loop();
  return function () { };
}

animations.register("loading", animateLoading);
animations.register("analyse", animateSound);

function analyseAudio($audio) {
  const ctx = new AudioContext();
  const audioSrc = ctx.createMediaElementSource($audio);
  const analyser = ctx.createAnalyser();
  audioSrc.connect(analyser);
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.connect(ctx.destination);

  const id = setInterval(() => {
    analyser.getByteFrequencyData(frequencyData);
    const sum = frequencyData.reduce((a, c) => a + c, 0);
    if (sum > 0) {
      clearInterval(id);
      animations.trigger("analyse", { analyser, frequencyData });
    }
  }, 1000);
}

analyseAudio($audio);

function renderVolumeMeter(value = 0, layout = "vertical") {
  if (layout === "vertical") {
    const bars = ["▁", "▂", "▃", "▅", "▆", "▇", "█"];
    const percent = value / 100;
    const clamped = percent > 1 ? 1 : percent;
    return bars[Math.floor(clamped * bars.length - 1)] || " ";
  } else {
    const length = 20;
    const percent = value / 100;
    const clamped = percent > 1 ? 1 : percent;
    return "█".repeat(Math.floor(clamped * length)).padEnd(20, "░");
  }
}

function renderLoadingBar(i) {
  const text = " Loading Stream ";
  const bar = "░".repeat(20);
  const position = bar.length - i % (5 + bar.length + text.length);
  return (
    bar.substring(0, position) + text.substring(Math.abs(Math.min(0, position)))
  )
    .substring(0, 20)
    .padEnd(20, "░");
}

const pre = document.createElement("pre");
document.querySelector("#animation").appendChild(pre);
$volume.textContent = "░".repeat(20);

let playing = false;
let loading = true;

poll("/api", 7000, (data) => {
  $song.textContent = data.title;
  $artist.textContent = data.artist;
  $listeners.textContent = `listeners: ${data.listeners}`;
  const title = `loungeFM - ${data.title} - ${data.artist}`;
  if (document.title !== title) {
    document.title = title;
  }
});

$toggle.addEventListener("click", () => {
  playing = !playing;

  if (playing) {
    if (!$audio.getAttribute("src")) {
      $audio.setAttribute("src", "/stream");
    }
    if (loading) {
      loading = false;
      animations.trigger("loading");
    }
    $audio.play();
    $toggle.textContent = "❙❙";
  } else {
    $audio.pause();
    $toggle.textContent = "▶";
  }
});

const render = (() => {
  let unsubscribe;

  return function (frames) {
    if (unsubscribe) unsubscribe();

    let frame = 0;
    pre.textContent = frames[0];
    unsubscribe = animate(() => {
      frame = (frame + 1) % frames.length;
      pre.textContent = frames[frame];
    }, 500);
  };
})();

const urls = [
  require("./scenes/bubbles.txt"),
  require("./scenes/island2.txt"),
  require("./scenes/computer.txt"),
  require("./scenes/lady.txt"),
];

const map = (url) => fetch(url).then((r) => r.text());

Promise.all(urls.map(map)).then((s) => {
  let scene = window.localStorage.getItem("scene") || 0;
  const scenes = s.map((s) => s.split("<<<FRAME>>>"));

  document.querySelector("#cycle").addEventListener("click", () => {
    scene = (parseInt(scene) + 1) % scenes.length;
    window.localStorage.setItem("scene", scene);
    render(scenes[scene]);
  });

  render(scenes[scene]);
});

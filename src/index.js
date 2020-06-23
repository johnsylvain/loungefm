import { animate, poll } from "./util";

const $toggle = document.querySelector("#toggle");
const $volume = document.querySelector("#volume");
const $audio = document.querySelector("#audio");
const $song = document.querySelector("#song");
const $artist = document.querySelector("#artist");
const $listeners = document.querySelector("#listeners");

function analyzeAudio($audio) {
  const ctx = new AudioContext();
  var audioSrc = ctx.createMediaElementSource($audio);
  var analyser = ctx.createAnalyser();
  audioSrc.connect(analyser);
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.connect(ctx.destination);

  function renderFrame() {
    requestAnimationFrame(renderFrame);
    analyser.getByteFrequencyData(frequencyData);
    const numberOfBands = 1;
    const bandWidth = Math.floor(1024 / numberOfBands)
    const bands = Array.from({ length: numberOfBands })
      .map((_, i) => frequencyData.slice(i * bandWidth, (i + 1) * bandWidth))
      .map((data) => data.reduce((a, c) => a + c, 0) / bandWidth)
      .reduce((res, band) => res + renderVolumeMeter(band, 'horizontal'), "");
    $volume.textContent = bands;
  }
  renderFrame();
}

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

function renderTimeStamp(current, end) {
  const format = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time - minutes * 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };
  return `${format(current)} / ${format(end)}`;
}

function renderProgressBar(current, max) {
  const length = 30;
  const percent = current / max;
  const active = Math.min(length, Math.floor(percent * length));
  return "█".repeat(active).padEnd(length, "░");
}

function renderLoadingBar(i) {
  const text = "Loading";
  const bar = "-".repeat(20);
  const position = bar.length - i;
  return (bar.substring(0, position) + text).substring(0, 20).padEnd(20, "-");
}

const pre = document.createElement("pre");
document.querySelector("#animation").appendChild(pre);

let playing = false;

analyzeAudio($audio);

poll("/api", 7000, (data) => {
  $song.textContent = data.title;
  $artist.textContent = data.artist;
  $listeners.textContent = `listeners: ${data.listeners}`;
  const title = `loungeFM - ${data.title} - ${data.artist}`
  if (document.title !== title) {
    document.title = title;
  }
});

$toggle.addEventListener("click", () => {
  playing = !playing;

  if (playing) {
    if (!$audio.getAttribute('src')) {
      $audio.setAttribute('src', '/stream')
    }
    $audio.play();
    $toggle.textContent = "❙❙";
  } else {
    $audio.pause();
    $toggle.textContent = "▶";
  }
});

function render(frames) {
  let frame = 0;
  pre.textContent = frames[0];
  animate(
    () => {
      frame = (frame + 1) % frames.length;
      pre.textContent = frames[frame];
    },
    500
  );
}

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

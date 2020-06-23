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
    const value = frequencyData.reduce((a, c) => a + c, 0) / 1024;
    $volume.textContent = renderVolumeMeter(value);
  }
  renderFrame();
}

function renderVolumeMeter(value) {
  const length = 20;
  const percent = value / 100;
  const clamped = percent > 1 ? 1 : percent;
  return "|".repeat(Math.floor(clamped * length)).padEnd(20, "-");
}

const $pre = document.createElement("pre");
document.querySelector("#animation").appendChild(pre);

let playing = false;

analyzeAudio($audio);

poll("/api", 5000, (data) => {
  $song.textContent = data.title;
  $artist.textContent = data.artist;
  $listeners.textContent = `listeners: ${data.listeners}`;
});

$toggle.addEventListener("click", () => {
  playing = !playing;

  if (playing) {
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
  animate(() => {
    frame = (frame + 1) % frames.length;
    pre.textContent = frames[frame];
  });
}

const urls = [
  require("./scenes/island2.txt"),
  require("./scenes/computer.txt"),
  require("./scenes/lady.txt"),
  require("./scenes/bubbles.txt"),
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

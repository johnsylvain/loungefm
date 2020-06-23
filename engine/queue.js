const fs = require("fs");
const { PassThrough } = require("stream");
const Throttle = require("throttle");
const { ffprobe } = require("@dropb/ffprobe");
const ffmetadata = require("ffmetadata");
const { promisify } = require("util");
const uuid = require("uuid/v4");
const metadata = promisify(ffmetadata.read);

class Queue {
  constructor() {
    this.clients = new Map();
    this.songs = [];
  }

  shuffle(a) {
    let arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async loadSongs(dir) {
    return new Promise((resolve) => {
      fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        this.songs = this.shuffle(files.map((file) => `${dir}/${file.name}`));
        resolve(this.songs);
      });
    });
  }

  broadcast(chunk) {
    for (const [, client] of this.clients) {
      client.write(chunk);
    }
  }

  addClient() {
    const client = new PassThrough();
    const id = uuid();
    this.clients.set(id, client);
    return { id, client };
  }

  removeClient(id) {
    this.clients.delete(id);
  }

  async getNextSong() {
    const url = this.songs.shift();
    const md = await metadata(url);
    let data;
    try {
      data = await ffprobe(url);
    } catch (e) {
      console.log(e);
    }
    this.currentSong = {
      url,
      artist: md.artist,
      title: md.title,
      duration: parseFloat(data.format.duration),
      bitRate: data.format.bit_rate || 128000,
    };
    return this.currentSong;
  }

  get current() {
    return this.currentSong;
  }

  async play() {
    if (this.songs.length) {
      const song = await this.getNextSong();
      const stream = fs.createReadStream(song.url);
      const throttle = new Throttle((song.bitRate || 128000) / 8);

      throttle
        .on("data", (chunk) => this.broadcast(chunk))
        .on("end", () => this.play());

      stream.pipe(throttle);
    }
  }
}

const queue = new Queue();

module.exports = queue;

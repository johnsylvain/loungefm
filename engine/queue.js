const fs = require("fs");
const { PassThrough } = require("stream");
const Throttle = require("throttle");
const { ffprobe } = require("@dropb/ffprobe");
const uuid = require("uuid/v4");
var jsmediatags = require("jsmediatags");

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
        const songs = files
          .filter((file) => {
            const parts = file.name.split(".");
            return parts[parts.length - 1] === "mp3";
          })
          .map((file) => `${dir}/${file.name}`);
        this.songs = this.shuffle(songs);
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

  async getArt(url) {
    jsmediatags.read(url, {
      onSuccess: async(tag) => {
        return tag
      },
      onError: (error) => {
        return null
      }
    });
  }

  async getNextSong() {
    let image = [];
    const url = this.songs.shift();
    let data;
    try {
      data = await ffprobe(url);
    } catch (e) {
      return await this.getNextSong()
    } 

    const currentSong = {
      url,
      artist: data.format.tags.artist,
      title: data.format.tags.title,
      genre: data.format.tags.genre,
      Album: data.format.tags.album,
      AlbumArtist: data.format.tags.album_artist,
      duration: Math.floor(parseFloat(data.format.duration)),
      bitRate:
        data && data.format && data.format.bit_rate
          ? parseInt(data.format.bit_rate)
          : 128000,
    };

    this.currentSong = currentSong;
    this.songs.push(url);
    return currentSong;
  }

  get current() {
    return this.currentSong;
  }

  async play() {
    if (this.songs.length) {
      const song = await this.getNextSong();
      const stream = fs.createReadStream(song.url);
      const throttle = new Throttle({
        bps: song.bitRate / 8,
        chunkSize: 512,
      });

      stream
        .pipe(throttle)
        .on("data", (chunk) => this.broadcast(chunk))
        .on("end", () => this.play())
        .on("error", () => this.play());
    }
  }
}

const queue = new Queue();

module.exports = queue;

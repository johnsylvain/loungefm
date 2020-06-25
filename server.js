const path = require("path");
const sirv = require("sirv");
const polka = require("polka");
const compress = require("compression")();
const send = require("@polka/send-type");
require("dotenv").config();
const queue = require("./engine/queue");
const syncMusic = require("./jobs/sync-music");

const PORT = process.env.PORT || 1337;

const assets = sirv(path.join(__dirname, "dist"), {
  immutable: true,
});

const app = polka();
app.use(compress, assets);

(async () => {
  if (process.env.NODE_ENV !== 'development') {
    await syncMusic();
  } else {
    await queue.loadSongs("audio");
  }
  await queue.play();

  app.get("/api", (req, res) => {
    send(res, 200, {
      artist: queue.current.artist,
      title: queue.current.title,
      duration: queue.current.duration,
      listeners: queue.clients.size,
    });
  });

  app.get("/stream", (req, res) => {
    const { id, client } = queue.addClient();
    send(res, 200, client, {
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
    });

    req.on("close", () => {
      queue.removeClient(id);
    });
  });

  app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Lounge on http://localhost:${PORT} 🍸`);
  });
})();

const polka = require("polka");
const send = require("@polka/send-type");
require("dotenv").config();
const queue = require("./engine/queue");


const PORT = process.env.PORT || 3000;
const app = polka();

(async () => {
  await queue.loadSongs("./audio");
  await queue.play();

  app.get("/api", (req, res) => {
    send(res, 200, {
      artist: queue.current.artist,
      title: queue.current.title,
      description: queue.current.description,
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
    console.log(`> radio on http://localhost:${PORT}`);
  });
})();

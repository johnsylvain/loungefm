const aws = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");
const rimraf = require("rimraf");
const cron = require("cron");
const execa = require("execa");
const { promisify } = require("util");
const queue = require("../engine/queue");

const writeFile = promisify(fs.writeFile);
const remove = promisify(rimraf);
const mkdir = promisify(fs.mkdir);

const s3 = new aws.S3({
  accessKeyId: process.env.S3_BUCKET_KEY,
  secretAccessKey: process.env.S3_BUCKET_SECRET,
  endpoint: new aws.Endpoint("nyc3.digitaloceanspaces.com"),
});

const pathToAudio = path.join(__dirname, "../audio");

async function downloadMusicArchive() {
  if (fs.existsSync(pathToAudio)) {
    await remove(pathToAudio);
  }
  await mkdir(pathToAudio);
  const data = await s3
    .getObject({
      Bucket: "jns/loungefm",
      Key: "music.zip",
    })
    .promise();
  await writeFile(path.join(__dirname, "../audio/archive.zip"), data.Body);
}

async function unzipArchive() {
  await extract(path.join(__dirname, "../audio/archive.zip"), {
    dir: pathToAudio,
  });
  await remove(path.join(__dirname, "../audio/archive.zip"));
}

function compressFiles() {
  return new Promise((resolve) => {
    fs.readdir(pathToAudio, { withFileTypes: true }, async (err, files) => {
      fs.mkdirSync(path.join(pathToAudio, 'compressed'))
      const compressionPromises = files
        .filter((file) => {
          const parts = file.name.split(".");
          return parts[parts.length - 1] === "mp3";
        }).map(song => {
          const input = path.join(pathToAudio, song.name)
          const output = path.join(pathToAudio, 'compressed', song.name)
          return execa('ffmpeg', ['-i', input, '-b:a', '128k', `${output}`, '-y'])
        })

      const songs = await Promise.all(compressionPromises);

      resolve(songs)
    });
  });
}

async function syncMusic() {
  console.log(`[info] downloading music archive`)
  await downloadMusicArchive();
  console.log(`[info] extracting music archive`)
  await unzipArchive();
  // console.log(`[info] compressing audio`)
  // await compressFiles();
  await queue.loadSongs(pathToAudio);
}

const job = cron.job("0 2 * * *", syncMusic, null, false, "America/Chicago");
job.start();

module.exports = syncMusic;

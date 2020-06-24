const aws = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");
const rimraf = require('rimraf');
const cron = require('cron');
const { promisify } = require("util");

const writeFile = promisify(fs.writeFile);
const remove = promisify(rimraf)
const mkdir = promisify(fs.mkdir)

const s3 = new aws.S3({
  accessKeyId: process.env.S3_BUCKET_KEY,
  secretAccessKey: process.env.S3_BUCKET_SECRET,
  endpoint: new aws.Endpoint("nyc3.digitaloceanspaces.com"),
});

async function downloadMusicArchive() {
  const pathToAudio = path.join(__dirname, '../audio')
  if (fs.existsSync(pathToAudio)) {
    await remove(pathToAudio)
  }
  await mkdir(pathToAudio)
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
    dir: path.join(__dirname, "../audio"),
  });
  await remove(path.join(__dirname, '../audio/archive.zip'))
}

// TODO
async function compressFiles() { }

async function syncMusic() {
  await downloadMusicArchive();
  await unzipArchive();
}

const job = cron.job('0 1 * * *', syncMusic, null, false, 'America/Chicago');
job.start();

module.exports = syncMusic;

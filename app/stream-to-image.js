const YOUTUBE_VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || 'wUPPkSANpyo'
const BASE_WIDTH = process.env.OCR_BASE_WIDTH || 1920
const BASE_HEIGHT = process.env.OCR_BASE_HEIGHT || 1080
const OCR_IMAGE_LEFT = process.env.OCR_IMAGE_LEFT || 450
const OCR_IMAGE_TOP = process.env.OCR_IMAGE_TOP || 860
// const OCR_IMAGE_WIDTH = process.env.OCR_IMAGE_WIDTH || 1470
// const OCR_IMAGE_HEIGHT = process.env.OCR_IMAGE_HEIGHT || 170
const OCR_IMAGE_WIDTH = BASE_WIDTH - OCR_IMAGE_LEFT
const OCR_IMAGE_HEIGHT = BASE_HEIGHT - OCR_IMAGE_TOP

const bin = require('ffmpeg-binaries')
const execFile = require('child_process').execFile
const ytdl = require('ytdl-core')
const sharp = require('sharp')

const takeScreenshot = (url, outFile, progress) => new Promise((resolve, reject) => {
  progress({'status': 'taking screenshot.', progress: 0.1})
  ytdl.getInfo(url).then(info => {
    progress({'status': 'taking screenshot.', progress: 0.5})
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' })
    const args = ['-i', format.url, '-frames:v', '1', '-an', '-y', outFile]
    // if (!format.live && position) args.splice(0, 0, '-ss', position)
    execFile(bin, args, (error, stdout, stderr) => {
      if (error) return reject({ error, stdout, stderr })
      resolve(outFile)
    })
  }).catch(reject)
})

const TMP_FILE = './tmp/stream.png'
const TMP_FILE_CUTTED = './tmp/stream-cutted.png'

module.exports = async progress => {
  await takeScreenshot(`https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`, TMP_FILE, progress)
  await sharp(TMP_FILE)
        .extract({
          left: OCR_IMAGE_LEFT,
          top: OCR_IMAGE_TOP,
          width: OCR_IMAGE_WIDTH,
          height: OCR_IMAGE_HEIGHT
        })
        .toFile(TMP_FILE_CUTTED)
  progress({'status': 'taking screenshot.', progress: 1})
  return true
}
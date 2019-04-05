const YOUTUBE_VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || 'wUPPkSANpyo'
const SCAN_INTERVAL = parseInt(process.env.SCAN_INTERVAL || 20)
const rimraf = require('rimraf')
const path = require('path')
var last_matched = ''
module.exports = async function main (args) {
  const { handleProgress} = args

  var scan_result
  try {
    // clear tmp dir
    await new Promise((resolve, reject) => {
      rimraf(path.join(ROOT_DIR, 'tmp', `${YOUTUBE_VIDEO_ID}*`), function(err){
        if (err) reject(err)
        resolve()
      })
    })

    // screenshot from stream
    await require(path.join(__dirname, 'stream-to-image'))(handleProgress)

    // run OCR
    scan_result = await require(path.join(__dirname, 'image-to-text-and-grap'))(handleProgress)
  } catch (error) {
    log(error)
  }

  const { matches, raws } = scan_result

  // prevent same result
  if ( last_matched != matches ){
    last_matched = matches
    let created_at = moment().format('LL LTS')
    handleProgress({
      created_at,
      matches,
      // raws,
      status: 'scan finished'
    })
  }

  var sleeping_counter = 0.1
  var c = setInterval(() => {
    sleeping_counter = sleeping_counter + 0.1

    if (sleeping_counter > 0.3) {
      handleProgress({status: `Scanner sleeping`, progress: sleeping_counter})
    }

    if (sleeping_counter >= (SCAN_INTERVAL/10) - 1) {
      clearInterval(c)
      // do next scan
      main(args)
    }

  }, 1000)
}





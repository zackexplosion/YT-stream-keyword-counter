const YOUTUBE_VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || 'wUPPkSANpyo'
const Tesseract = require('tesseract.js')
const image = require('path').join(ROOT_DIR, 'tmp', `${YOUTUBE_VIDEO_ID}-stream-cutted.png`)

const done = data => {
  let result = {
    raw: data.symbols,
    matches: ''
  }
  data.symbols.forEach(w =>{
    result.matches += w.text
  })
  return result
}

module.exports = (progress = function(){}) =>{
  return new Promise( (resolve, reject) => {
    Tesseract.recognize(image, {
      lang: 'chi_tra',
    })
    .progress(function(info){
      progress(info)
    })
    .then(function(data){
      resolve(done(data))
      Tesseract.terminate()
    })
    .catch(reject)

  })
}
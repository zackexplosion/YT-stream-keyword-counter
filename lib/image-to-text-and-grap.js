const Tesseract = require('tesseract.js')
const image = './tmp/stream-cutted.png'

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
      langPath: './tmp/chi_tra'
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
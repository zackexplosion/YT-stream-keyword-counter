const statusCodeSheet = [
  {
    code: 1,
    status: 'taking screenshot.',
    text: '貨出的去！正在擷取直播來源'
  },
  {
    code: 2,
    status: 'loading tesseract core|initializing api',
    text: '人進的來！正在載入 Tesseract 光學文字讀取器核心'
  },
  {
    code: 3,
    status: 'recognizing text',
    text: '高雄要發大財啦！分析中請稍後'
  },
  {
    code: 4,
    status: 'Counter not changed.',
    text: '真是又老又窮！找不到關鍵字或是掃描結果與上一次相同'
  },
  {
    code: 5,
    status: 'Scanner sleeping',
    text: '北漂啦！掃瞄器休息中..'
  },
  {
    code: 6,
    status: 'update counter',
    text: '蔣公轉世啦！更新計數器'
  }
]

const excludes = [
  'loaded tesseract core',
  'initializing tesseract',
  'loading chi_tra.traineddata'
]
const DEFAULT_PROGRESS = 25
var last_progress = 0

module.exports = ({ io, log })  => {
  function getCode (status) {
    let code
    statusCodeSheet.forEach(c =>{
      // const reg = new RegExp(c.status, 'g')
      // const m = status.match(reg)
      // if (m) {
      //   log(m)
      //   code = c.c
      // }
      // log(c)
      if (c.status && c.status.indexOf(status) != -1) {
        code = c.code
      }
    })
    log(status, code)
    return code
  }

  function handleProgress (info) {
    const { status } = info
    if (!status) return

    // exclude status
    if (excludes.includes(status)) return

    var code = getCode(status)

    var progress
    if (!isNaN(info.progress)) {
      progress = parseInt(info.progress * 100)
      if (progress < 10) {
        progress = DEFAULT_PROGRESS
      }
    }

    // default progress for code 2
    if (code == 2 && !info.progress) {
      progress = DEFAULT_PROGRESS
    }

    if (code == 3 ){
      let gate = last_progress + 10
      let skip = gate <= progress || gate > 100
      last_progress = progress
      if (skip) return
      // log('last_progress', last_progress, progress,  skip)
    }

    log(info)

    if (code == 6) {
      return io.emit('updateCounter', {
        counter: info.counter,
        matches: info.matches
      })
    }

    if (code) {
      info = {
        c: code
      }

      if (progress) {
        info.p = progress
      }
    }

    io.emit('p', info)
  }

  return {
    statusCodeSheet,
    handleProgress
  }
}

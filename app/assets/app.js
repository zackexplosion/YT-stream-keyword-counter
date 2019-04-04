(function(){
  const socket = io('/')
  const status = document.getElementById('status')
  const progress = document.getElementById('progress')
  const keywords = $('#keywords')
  const history = $('#history')
  const bar = $('.progress-bar')
  const live_counter = $('#live-counter .badge')

  $.ajax('/codesheet').then(codeSheet =>{
    const getText = code => {
      let text = 'yee'
      codeSheet.forEach(c =>{
        if (c.c == code) text = c.t
      })
      return text
    }

    socket.on('p', updateStatusAndProgress = data => {
      status.innerHTML = getText(data.c)

      if (data.p) {
        bar.css({width: data.p + '%'})
        progress.style.display = 'flex'
      } else {
        bar.css({width: '0%'})
      }
    })
  })

  function createListItem(text) {
    return `<li class="list-group-item">${text}</li>`
  }

  socket.on('updateCounter', data => {
    keywords.html('')

    Object.keys(data.counter).forEach(k =>{
      keywords.append(`<li class="list-group-item d-flex justify-content-between align-items-center">${k} <span class="badge badge-primary badge-pill">${data.counter[k]}</span></li>`)
    })

    history.prepend(createListItem(`${data.created_at}: ${data.matches}`))
  })

  socket.on('uuc', function updateUserCounter(data){
    live_counter.html(data)
  })
})()
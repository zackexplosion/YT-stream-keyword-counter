(function(){
  const status = document.getElementById('status')
  const keywords = $('#keywords')
  const history = $('#history')
  const progress_bar = $('.progress-bar')
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
      let percent = data.p || '0'
      progress_bar.css({width: percent + '%'})
    })
  })

  socket.on('updateCounter', data => {
    chartUpdater()
    $.ajax('/keywords').then(c => {
      keywords.html(c)
    })

    history.prepend(`<li class="list-group-item">${data.created_at}: ${data.matches}</li>`)
  })

  socket.on('uuc', function updateUserCounter(data){
    live_counter.html(data)
  })

})()
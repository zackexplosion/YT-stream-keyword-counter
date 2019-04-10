moment.locale('zh-tw')
import './_chart'
(function(){
  if (navigator != undefined && navigator.userAgent != undefined) {
    let user_agent = navigator.userAgent.toLowerCase()
    if (user_agent.indexOf('android') > -1) { // Is Android.
      $(document.body).addClass('android')
    } else if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
      $(document.body).addClass('ios')
    }
  }

  var $channels = $('#channels')
  $channels.owlCarousel({
    items: 1,
    loop:true,
    margin:10,
    nav:true,
  })

  $('ul.nav.channels .nav-link').on('click', function(e) {
    e.preventDefault()
    let cid = $(this).attr('data-cid')
    $channels
  })

  const status = document.getElementById('status')
  // const keywords = $('#keywords')
  const history = $('#history')
  const progress_bar = $('.progress-bar')
  const live_counter = $('#live-counter .badge')

  const chat_toggler = e => {
    $('.chat-toggle').toggleClass('active')
    $('body').toggleClass('chat-opned')
  }

  $('#chat-toggle input').on('click', e => {
    chat_toggler()
    $('#chat-toggle input').prop('checked', true)
  })
  $('.chat-toggle').on('click', chat_toggler)

  $.ajax('/codesheet').then(codeSheet =>{
    const getText = code => {
      let text = 'yee'
      codeSheet.forEach(c =>{
        if (c.c == code) text = c.t
      })
      return text
    }
    socket.on('p', data => {
      if(!status) return
      status.innerHTML = getText(data.c)
      let percent = data.p || '0'
      progress_bar.css({width: percent + '%'})
    })
  })

  socket.on('updateCounter', data => {
    // chartUpdater()
    // $.ajax('/keywords').then(c => {
    //   keywords.html(c)
    // })

    history.prepend(`<li class="list-group-item">${data.created_at}: ${data.matches}</li>`)
  })

  socket.on('uuc', function updateUserCounter(data){
    live_counter.html(data)
  })

})()
moment.locale('zh-tw')
import updateChart from './_chart'
// import 'node_modules/slick-carousel/slick.js'
// import 'slick-carousel/slick/slick'
(function(){
  if (navigator != undefined && navigator.userAgent != undefined) {
    let user_agent = navigator.userAgent.toLowerCase()
    if (user_agent.indexOf('android') > -1) { // Is Android.
      $(document.body).addClass('android')
    } else if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
      $(document.body).addClass('ios')
    }
  }

  var is_chart_updaing = true

  // updateChart().then(() => {
  //   is_chart_updaing = false
  // })


  var $carousel = $('#channels')
  $carousel.slick({
    arrows: false,
    centerMode: true,
    centerPadding: '60px',
    adaptiveHeight: true,
    variableWidth: true,
    slidesToShow: 3
  })

  function handleSlide(event, slick, currentSlide, nextSlide) {
    var {
      id,
      skip
    } = $(slick.$slides.get(nextSlide)).data('channel')
    if (skip !== 'undefined') {
      // console.log('skip', skip)
      // debugger
      $chart.addClass('skip-chart')
    } else {
      is_chart_updaing = true
      $chart.removeClass('skip-chart')
      updateChart(id).then(() =>{
        // console.log('chart updated')
        is_chart_updaing = false
      })
    }
  }

  handleSlide(null, null, 0, 0)

  const $chart = $('#charts')
  $carousel.on('beforeChange', handleSlide)

  $(document).on('keydown', function(e) {
    if ( is_chart_updaing ) return
    if (e.keyCode == 37) {
      $carousel.slick('slickPrev')
    }
    if (e.keyCode == 39) {
      $carousel.slick('slickNext')
    }
  })

  $(window).on('resize', function() {
    $carousel.slick('resize')
  })

  // $('ul.nav.channels .nav-link').on('click', function(e) {
  //   e.preventDefault()
  //   let cid = $(this).attr('data-cid')
  //   $channels
  // })

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
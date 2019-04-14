moment.locale('zh-tw')
import { initChart, updateChart } from './_chart'
import setupPlayers from './_players'
// import 'node_modules/slick-carousel/slick.js'
// import 'slick-carousel/slick/slick'
function getRandomInt(min, max) {
  return parseInt(Math.random() * (max - min) + min)
}
(function(){
  // add device class
  if (navigator != undefined && navigator.userAgent != undefined) {
    let user_agent = navigator.userAgent.toLowerCase()
    if (user_agent.indexOf('android') > -1) { // Is Android.
      $(document.body).addClass('android')
    } else if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
      $(document.body).addClass('ios')
    }
  }

  // show overlay
  $.LoadingOverlay("show")
  let isAllReady = false
  let allReady = []
  let isPlaying = false
  let players
  allReady.push(setupPlayers.then(_players => {
    // console.log(players)
    // debugger
    _players.on('play', e => {
      isPlaying = true
    })
    players = _players
  }))


  const $chart = $('#charts')

  var is_chart_updaing = true
  var $carousel = $('#channels')

  let channels = $('.slick-item').map((i, s) => {
    return $(s).data('channel')
  })

  var initialSlide = 0
  if (window.location.hash) {
    let channel_id = window.location.hash.substring(1)
    initialSlide = Array.from(channels).findIndex(c => {
      return c.id == channel_id
    })
  } else {
    // first channel is random
    initialSlide = getRandomInt(0, channels.length -1)
  }

  // console.log(initialSlide)

  function handleSlide(event, slick, currentSlide, nextSlide) {
    var {
      id,
      name,
      skip
    } = channels.get(nextSlide)

    // navbar class
    $('.nav-item a').removeClass('active')
    $($('.nav-item a').get(nextSlide+1)).addClass('active')

    // change url
    window.location.hash = id

    // ga tracking
    gtag('event', 'page_view')

    $('.channel-name').html(name)

    // console.log(players, isPlaying)
    if (players && isPlaying) {
      players.mute()
      players.play(nextSlide)
      players.unMute(nextSlide)
    }
    // shkped channels
    if (skip) {
      $chart.addClass('skip-chart')
    } else {
      is_chart_updaing = true
      $chart.removeClass('skip-chart')

      // if loading time over X ms, show loading overlay
      let t = setTimeout(() => {
        if (isAllReady) {
          $.LoadingOverlay("show")
        }
      }, 100 * 2)

      updateChart(id).then(() =>{
        clearTimeout(t)
        is_chart_updaing = false
        if (isAllReady) {
          $.LoadingOverlay("hide")
        }
      })
    }
  }

  allReady.push(new Promise((resolve, reject) => {
    initChart().then( _  => {
      $carousel
      .on('init', function(e, slick, slide) {
        handleSlide(e, slick, slide, initialSlide)
        resolve()
        console.log('slick ready')
      })
      .on('beforeChange', handleSlide)
      .slick({
        arrows: false,
        centerMode: true,
        centerPadding: '60px',
        initialSlide,
        infinite: false,
        adaptiveHeight: true,
        variableWidth: true,
        slidesToShow: 3
      })
    })
  }))

  Promise.all(allReady).then(d => {
    console.log(d)
    $.LoadingOverlay("hide")
    isAllReady = true
  })

  // bind nav click events
  $('.nav-item.channels a').on('click', e => {
    let index = $(e.target).data('index')
    $carousel.slick('slickGoTo', index)
    // handleSlide(null, $carousel, 0, index)
  })

  // create a simple instance
  // by default, it only adds horizontal recognizers
  var mc = new Hammer(window)

  mc.get('pan').set({
    direction: Hammer.DIRECTION_ALL
  })

  // listen to events...
  mc.on("swipeleft swiperight", function(ev) {
    // console.log(ev.type +" gesture detected.")
    switch(ev.type){
      case 'swipeleft':
        $carousel.slick('slickNext')
      break
      case 'swiperight':
        $carousel.slick('slickPrev')
      break
    }
  })

  $(window).on('keydown', function(e) {
    // console.log(e.keyCode)
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

  // const status = document.getElementById('status')
  // const history = $('#history')
  // const progress_bar = $('.progress-bar')


  // chatroom toggler
  const chat_toggler = e => {
    $('.chat-toggle').toggleClass('active')
    $('body').toggleClass('chat-opned')
  }

  $('#chat-toggle input').on('click', e => {
    chat_toggler()
    $('#chat-toggle input').prop('checked', true)
  })
  $('.chat-toggle').on('click', chat_toggler)

  // TODO
  // real time progress update
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

  // Sockets
  socket.on('updateCounter', data => {
    history.prepend(`<li class="list-group-item">${data.created_at}: ${data.matches}</li>`)
  })

  const live_counter = $('#live-counter .badge')
  socket.on('uuc', function updateUserCounter(data){
    live_counter.html(data)
  })

    // reload whole page when version changed
  let version = false
  socket.on('checkVersion', _version => {
    console.log('checkVersion', _version, version)
    if (version && version != _version) {
      window.location = '/'
    }
    version = _version
  })
})()
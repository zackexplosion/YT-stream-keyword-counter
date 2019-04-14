import { Promise } from "es6-promise";

var tag = document.createElement('script')
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

// function onYouTubeIframeAPIReady(){
//   console.log('onYouTubeIframeAPIReady')
// }
var player_events = []
var players = function(_players){

  function doAction(action, index) {
    if (index) {
      _players[index][action]()
    } else {
      _players.forEach(p => {
        p[action]()
      })
    }
  }
  // let p = {}
  // player_actions.map(a => {
  //   p[a]
  // })

  // return p

  return {
    unmute: function (i) {
      doAction('unmute', i)
    },
    mute: function (i) {
      doAction('mute', i)
    },
    play: function(i) {
      console.log('do play')
      doAction('playVideo', i)
    },
    pause: function (i) {
      doAction('pauseVideo', i)
    },
    on: function (event, f) {
      player_events.push([event, f])
    }
  }
}

const createPlayer = function (channel, element) {
  return new Promise((resolve, reject) => {
    let player = new YT.Player(element, {
      videoId: channel.vid,
      playerVars: {
        'pause-overlay': 0,
        'autoplay': 0,
        'controls': 0
      },
      events: {
        onReady: function(){
          resolve(player)
        },
        onStateChange: function(event) {
          // console.log('event.data', event.data)
          switch (event.data) {
            case 1:
              // playing
              player_events.forEach(e => {
                // console.log(e)
                if(e[0] == 'play'){
                  e[1]()
                }
              })
              break;
            default:
              break;
          }
        }
      }
    })
  })
}

var promise = new Promise((resolve, reject) => {
  window.onYouTubeIframeAPIReady = function() {
    // console.log('onYouTubeIframeAPIReady')
    const $channels = $('#channels .slick-slide')
    let _players = []

    $channels.find('.video-wrapper img').each((_index, element) => {
      let channel = $($channels[_index]).data('channel')
      _players.push(createPlayer(channel, element))
    })

    Promise.all(_players).then(_players => {
      console.log('all player ready')
      resolve(new players(_players))
    })
  }
})

export default promise
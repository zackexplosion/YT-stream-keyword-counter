moment.locale('zh-tw')
$(function() {
  var FADE_TIME = 150 // ms
  var TYPING_TIMER_LENGTH = 400 // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ]

  // Initialize variables
  var $window = $(window)
  var $usernameInput = $('.usernameInput') // Input for username
  var $messages = $('.messages') // Messages area
  var $inputMessage = $('.inputMessage') // Input message input box

  var $loginPage = $('.login.page') // The login page
  var $chatPage = $('.chat.page') // The chatroom page
  var $username = $('section.input .username')
  var $usernameInput = $('.usernameInput')

  // Prompt for setting a username
  var username
  var connected = false
  var typing = false
  var lastTypingTime
  var $currentInput = $usernameInput.focus()
  var isChangingUsername = false
  var reconnect = false

  var socket = io('/', {path : '/chat'})
  // var socket = io('/')

  const addParticipantsMessage = (data) => {
    var message = ''
    // if (data.numUsers === 1) {
    //   message += "there's 1 participant"
    // } else {
    //   message += "現在有 " + data.numUsers + " 位喜韓兒"
    // }
    // message += "現在有 " + data.numUsers + " 位喜韓兒"
    log(message)
  }

  // Sets the client's username
  const setUsername = () => {
    let input = $usernameInput.val().trim()
    // prevent empty username
    if (input.length <= 0){
      return false
    }

    isChangingUsername = false
    $loginPage.fadeOut()
    $chatPage.show()
    $loginPage.off('click')
    $currentInput = $inputMessage.focus()

    // If the username is changed
    if (username == input ) return
    username = cleanInput(input)
    $username.val(username)
    // Tell the server your username
    socket.emit('change username', username)
  }

  // Sends a chat message
  const sendMessage = () => {
    var message = $inputMessage.val()
    // Prevent markup from being injected into the message
    message = cleanInput(message)
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('')
      // addChatMessage({
      //   username: username,
      //   message: message
      // })
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message)
    }
  }

  // Log a message
    const log = (message, options) => {
    var $el =
      $('<li>')
      .addClass('log')
      .text(moment().locale('zh-tw').format('LLL') + ': ' + message)
    addMessageElement($el, options)
  }

  // Adds the visual chat message to the message list
  const addChatMessage = (data, options) => {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data)
    options = options || {}
    if ($typingMessages.length !== 0) {
      options.fade = false
      $typingMessages.remove()
    }
    var $timestamp = $('<span class="timestamp"/>')
    .text(moment(data.timestamp).format('LT'))
    // .css('color', getUsernameColor(data.username))
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username))
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message)

    var typingClass = data.typing ? 'typing' : ''
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($timestamp, $usernameDiv, $messageBodyDiv)

    addMessageElement($messageDiv, options)
  }

  // Adds the visual chat typing message
  const addChatTyping = (data) => {
    data.typing = true
    data.message = 'is typing'
    addChatMessage(data)
  }

  // Removes the visual chat typing message
  const removeChatTyping = (data) => {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove()
    })
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  const addMessageElement = (el, options) => {
    var $el = $(el)

    // Setup default options
    if (!options) {
      options = {}
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME)
    }
    if (options.prepend) {
      $messages.prepend($el)
    } else {
      $messages.append($el)
    }
    $messages[0].scrollTop = $messages[0].scrollHeight
  }

  // Prevents input from having injected markup
  const cleanInput = (input) => {
    return $('<div/>').text(input).html()
  }

  // Updates the typing event
  const updateTyping = () => {
    if (connected) {
      if (!typing) {
        typing = true
        socket.emit('typing')
      }
      lastTypingTime = (new Date()).getTime()

      setTimeout(() => {
        var typingTimer = (new Date()).getTime()
        var timeDiff = typingTimer - lastTypingTime
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing')
          typing = false
        }
      }, TYPING_TIMER_LENGTH)
    }
  }

  // Gets the 'X is typing' messages of a user
  const getTypingMessages = (data) => {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username
    })
  }

  // Gets the color of a username through our hash function
  const getUsernameColor = (username) => {
    // Compute hash code
    var hash = 7
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length)
    return COLORS[index]
  }

  // Keyboard events

  $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus()
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (isChangingUsername){
        setUsername()
      } else {
        sendMessage()
        socket.emit('stop typing')
        typing = false
      }
    }
  })

  $inputMessage.on('input', () => {
    updateTyping()
  })

  // Click events

  $username.click(() =>{
    isChangingUsername = true
    $loginPage.fadeIn()
    $chatPage.hide()
    $loginPage.on('click')
  })

  // Focus input when clicking anywhere on login page
  $loginPage.click(() => {
    $currentInput.focus()
  })

  // Focus input when clicking on the message input's border
  $inputMessage.click(() => {
    $inputMessage.focus()
  })

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', (data) => {
    username = data.username
    $username.val(username)
    $usernameInput.val(username)
    connected = true
    // Display the welcome message
    var message = "歡迎來到喜韓兒聊天室 – "
    log(message, {
      prepend: true
    })
    // addParticipantsMessage(data)
    if (Array.isArray(data.history)) {
      data.history.forEach(d => {
        addChatMessage(d)
      })
    }
  })

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', (data) => {
    addChatMessage(data)
  })

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', (data) => {
    log(data.username + ' 加入惹')
    // addParticipantsMessage(data)
  })

  socket.on('username changed', (data) => {
    log(`${data.oldusername} 將喜韓兒ID改為 ${data.username}`)
    // addParticipantsMessage(data)
  })

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', (data) => {
    log(data.username + ' 離開了這個世界.....')
    // addParticipantsMessage(data)
    removeChatTyping(data)
  })

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', (data) => {
    addChatTyping(data)
  })

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', (data) => {
    removeChatTyping(data)
  })

  socket.on('disconnect', () => {
    reconnect = true
    log('斷線囉，請稍後')
  })

  socket.on('reconnect', () => {
    log('重新連線成功')
    if (username) {
      socket.emit('add user', username)
    }
  })

  socket.on('reconnect_error', () => {
    log('attempt to reconnect has failed')
  })

})

const socket = io('/')
const status = document.getElementById('status')
const progress = document.getElementById('progress')
const history = $('#history')
const bar = $('.progress-bar')

const updateStatus = data =>{
  status.innerHTML = data.status

  if (data.progress) {
    // zero shows nothing prevent this on progress bar
    if (data.progress == 0) data.progress = 5
    bar.css({width: data.progress + '%'})
    progress.style.display = 'flex'
  } else {
    // $(bar).attr('aria-valuenow', p)
    bar.css({width: '0%'})
    progress.style.display = 'none'
  }
}

const updateCounterAndHistory = data => {
  if (!data.code && data.code !== 'COUNTER_CHANGED') return
  history.prepend(`<li class="list-group-item">${data.matches}</li>`)
}

socket.on('progressUpdate', data => {
  updateStatus(data)
  updateCounterAndHistory(data)
})

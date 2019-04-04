(function(){
  const socket = io('/')
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

  // var ctx_live = document.getElementById("chart")
  var ctx_live = $('#chart canvas')
  var myChart = new Chart(ctx_live, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderWidth: 1,
        borderColor:'#00c0ef',
        label: '總出現次數',
      }]
    },
    options: {
      responsive: true,
      // title: {
      //   display: true,
      //   text: "Chart.js - Dynamically Update Chart Via Ajax Requests",
      // },
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          }
        }]
      }
    }
  })
  const chartUpdater = () =>{
    $.ajax('/chartdata').then(res =>{
      myChart.options.title ={
        display: true,
        text: '現在時間:' + res.now
      }
      myChart.data.labels = res.x.reverse()
      myChart.data.datasets[0].data = res.data

      myChart.update()
      setTimeout(()=>{
        $('#chart span').hide()
      }, 1000)

    })
  }

  chartUpdater()

  // setInterval(chartUpdater, 3000)

})()
const randomColor = () => {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

var createSheet = function({label, data}) {
  var color = randomColor()
  return {
    fill: false,
    label,
    data,
    backgroundColor: color,
    borderColor: color,
  }
}

var config = {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    title: {
      display: true,
      // text: 'Chart.js Line Chart'
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        // scaleLabel: {
        //   display: true,
        //   labelString: '时间'
        // }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: '次数'
        }
      }]
    }
  }
}
var myChart = new Chart($('#chart canvas'), config)
const chartUpdater = () =>{
  $.ajax('/chartdata').then(res =>{
    myChart.options.title ={
      display: true,
      text: '現在時間:' + res.now
    }
    myChart.data.labels = res.x.reverse()
    // myChart.data.datasets[0].data = res.data
    myChart.data.datasets = []

    Object.keys(res.sheets).forEach(k =>{
      let s = createSheet({label: k, data: res.sheets[k]})
      myChart.data.datasets.push(s)
    })

    myChart.update()
    // setTimeout(()=>{
    //   $('#chart span').hide()
    // }, 1000)
  })
}

chartUpdater()
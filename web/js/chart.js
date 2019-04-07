(function(){
  moment.locale('zh-tw')
  const labelColors = {
    '韓': '#007FFF',
    '國瑜': '#3E8EDE',
    '韓流': '#2D68C4',
    '韓粉': '#0047AB',
    '蔡': '#A7FC00',
    '蔡英文': '#009E60'
  }
  const randomColor = () => {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  const getColorByLabel = label => {
    var color = labelColors[label]
    if (!color) color = randomColor()
    return color
  }

  var createSheet = function({label, data}) {
    const color = getColorByLabel(label)
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
      maintainAspectRatio: false,
      responsive: false,
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
  var canvas = $('#chart canvas')
  //
  if (!canvas.length) return

  var myChart = new Chart(canvas, config)
  const chartUpdater = () => {
    const channel_id = (location.pathname+location.search).substr(1).split('=')[1]
    $.ajax('/chartdata/' + channel_id).then(res =>{
      myChart.options.title ={
        display: true,
        text: '現在時間:' + moment(res.now).format('lll')
      }
      myChart.data.labels = res.x.reverse().map(x =>{
        return moment(x).format('MM/DD LT')
      })
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
})()

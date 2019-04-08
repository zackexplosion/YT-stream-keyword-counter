
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

function main ({utils, chart}) {
  const { getColorByLabel } = utils
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

  function update (res) {
    chart.options.title = {
      display: true,
      text: '繪製時間:' + moment(res.now).format('lll')
    }
    chart.data.labels = res.x.reverse().map(x =>{
      return moment(x).format('MM/DD LT')
    })
    // myChart.data.datasets[0].data = res.data
    chart.data.datasets = []

    Object.keys(res.sheets).forEach(k =>{
      let s = createSheet({label: k, data: res.sheets[k]})
      chart.data.datasets.push(s)
    })

    chart.update()
  }

  return {
    update
  }
}

export default {
  name: '近24小時',
  size: '12',
  className: 'recents',
  main, config
}
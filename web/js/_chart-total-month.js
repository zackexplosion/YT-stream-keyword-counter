var config = {
  type: 'polarArea',
  data: {
    datasets: [],
    labels: []
  },
  options: {
    legend: {
      position: 'right',
    }
  }
}


function main({ utils, chart }) {
  const { getColorByLabel } = utils

  function update(res) {
    chart.options.title = {
      display: true,
      text: '繪製時間:' + moment(res.now).format('lll')
    }

    let labels = Object.keys(res.data)
    chart.data.labels = labels

    let backgroundColor = []
    let data = []
    labels.forEach( l => {
      backgroundColor.push(getColorByLabel(l))
      data.push(res.data[l])
    })

    chart.data.datasets = [{
      backgroundColor,
      data
    }]

    // debugger

    chart.update()
  }

  return {
    update
  }
}

export default {
  name: '月累積',
  size: '6',
  className: 'total-months',
  main, config
}
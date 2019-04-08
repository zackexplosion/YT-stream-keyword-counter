var config = {
  type: 'pie',
  data: {
    datasets: [
    // {
    //   data: [],
    //   backgroundColor: [],
    //   label: 'Dataset 1'
    // }
    ],
    labels: []
  },
  options: {
    legend: {
      // display: false
      position: 'right',
    },
  }
}


function main({ utils, chart }) {
  const { getColorByLabel } = utils

  function update(res) {
    chart.options.title = {
      display: true,
      text: '繪製時間:' + moment(res.now).format('lll')
    }

    let { sheets }  = res
    let labels = Object.keys(sheets)
    chart.data.labels = labels

    let backgroundColor = []
    let data = []
    labels.forEach( l => {
      backgroundColor.push(getColorByLabel(l))

      let a = sheets[l]
      let tmp_data = 0
      if (Array.isArray(a)) {
        a.forEach(_ =>{
          tmp_data = tmp_data + _
        })
      }
      data.push(tmp_data)
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
  name: '日累積',
  size: '6',
  api: 'recents',
  className: 'total-days',
  main, config
}
import totalMonth from './_chart-total-month'
import totalDay from './_chart-total-day'
import recents from './_chart-recents.js'

const labelColors = {
  '韓': '#007FFF',
  '國瑜': '#3E8EDE',
  '韓流': '#2D68C4',
  '韓粉': '#0047AB',
  // '蔡': '#A7FC00',
  '蔡': '#009E60',
  '蔡英文': '#609E60',
  '賴清德': '#909E60',
  '柯': '#DE2910',
  '柯文哲': '#9E2810',
}

const randomColor = () => {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function getColorByLabel (label) {
  var color = labelColors[label]
  if (!color) color = randomColor()
  return color
}
let charts = [];

(function(){
  const $baseElement = $('#charts .row')
  if ($baseElement.length == 0) {
    console.error('no charts element found')
    return false
  }

  const utils = {
    getColorByLabel
  }
  const _charts = [recents, totalDay, totalMonth]
  _charts.forEach(c => {
    let { name, className, api, config, main, size } = c
    $baseElement.append(`<div class="col-lg-${size}"><h4>${name}</h4><div class="canvas-wrapper"><canvas class="${className}"></canvas></div></div>`)

    let chart = new Chart($baseElement.find('.' + className), config)
    chart = main({utils, chart})

    chart.className = className
    chart.api = api
    charts.push(chart)
  })

})()



function updateChart(channel_id = 'cti') {
  var promises = []
  charts.forEach(c => {
    let api = c.className
    if (c.api) api = c.api

    let p = $.ajax(`/chartdata-${api}/${channel_id}`).then(res =>{
      c.update(channel_id, res)
    })

    promises.push(p)
  })

  return Promise.all(promises)
}


export default updateChart
function configFactory (config) {
  return Object.assign({
    data: {
      datasets: [],
      labels: []
    },
    options: {
      legned: {
        labels: {}
      },
      title: {
        display: true,
        text: 'yee'
      }
    }
  }, config)
}

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

const utils = {
  configFactory,
  getColorByLabel,
  createTitle: channel => {
    return {
      display: true,
      text: `頻道: ${channel.id.toUpperCase()}, 統計時間: ${moment().format('lll')}`
    }
  }
}

module.exports = utils
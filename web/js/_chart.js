function generateLabels(chart) {
  var data = chart.data;
  if (data.labels.length && data.datasets.length) {
    return data.labels.map(function (label, i) {
      var ds = data.datasets[0];
      var arc = chart.getDatasetMeta(0).data[i];
      var custom = arc && arc.custom || {};
      var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
      var arcOpts = chart.options.elements.arc;
      var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
      var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
      var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

      var value = chart.config.data.datasets[chart.getDatasetMeta(0).data[i]._datasetIndex].data[chart.getDatasetMeta(0).data[i]._index];

      return {
        text: label + " : " + value,
        fillStyle: fill,
        strokeStyle: stroke,
        lineWidth: bw,
        hidden: isNaN(ds.data[i]) || chart.getDatasetMeta(0).data[i].hidden,
        index: i
      };
    });
  } else {
    return [];
  }
}

var charts = [];
export function initChart() {
  const $baseElement = $('#charts .row')
  if ($baseElement.length == 0) {
    console.error('no charts element found')
    return false
  }

  return $.ajax('/chart-configs').then(res => {
    res.forEach(c => {
      let { name, className, api, config, size } = c

      $baseElement.append(`<div class="col-lg-${size}"><h4>${name}</h4><div class="canvas-wrapper"><canvas class="${className}"></canvas></div></div>`)

      if (['pie', 'polarArea'].includes(config.type)) {
        config.options.legend.labels = {
          generateLabels
        }
      }
      let chart = new Chart($baseElement.find('.' + className), config)
      chart.api = api || className
      charts.push(chart)
    })
  })
}

export function updateChart(channel_id = 'cti') {
  var promises = []
  charts.forEach(c => {
    let p = $.ajax(`/chartdata-${c.api}/${channel_id}`).then(res => {
      c.data = res.data
      c.options.title = res.options.title
      c.update()
    })

    promises.push(p)
  })

  return Promise.all(promises)
}
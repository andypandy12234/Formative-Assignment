
/**
     * To make this chart I followed a youtube tutorial https://www.youtube.com/watch?v=LO-8xiB3Z_Q
     */

let emissionsData
const truncLengh = 30
$(document).ready(function () {
  Plot()
})
function Plot () {
  TransformChartData(chartData, chartOptions)
  BuildBar('chart', chartData, chartOptions)
}

function BuildBar (id, chartData, options, level) {
  // d3.selectAll("#" + id + " .innerCont").remove();
  // $("#" + id).append(chartInnerDiv);
  chart = d3.select('#' + id + ' .innerCont')

  const margin = { top: 50, right: 10, bottom: 30, left: 50 }
  const width = $(chart[0]).outerWidth() - margin.left - margin.right
  const height = $(chart[0]).outerHeight() - margin.top - margin.bottom
  let xVarName
  const yVarName = options[0].yaxis

  if (level == 1) {
    xVarName = options[0].xaxisl1
  } else {
    xVarName = options[0].xaxis
  }

  const xAry = runningData.map(function (el) {
    return el[xVarName]
  })

  const yAry = runningData.map(function (el) {
    return el[yVarName]
  })

  const capAry = runningData.map(function (el) { return el.caption })

  const x = d3.scale.ordinal().domain(xAry).rangeRoundBands([0, width], 0.5)
  const y = d3.scale.linear().domain([0, d3.max(runningData, function (d) { return d[yVarName] })]).range([height, 0])
  const rcolor = d3.scale.ordinal().range(runningColors)

  chart = chart
    .append('svg') // append svg element inside #chart
    .attr('width', width + margin.left + margin.right) // set width
    .attr('height', height + margin.top + margin.bottom) // set height

  const bar = chart.selectAll('g')
    .data(runningData)
    .enter()
    .append('g')
  // .attr("filter", "url(#dropshadow)")
    .attr('transform', function (d) {
      return 'translate(' + x(d[xVarName]) + ', 0)'
    })

  let ctrtxt = 0
  const xAxis = d3.svg.axis()
    .scale(x)
  // .orient("bottom").ticks(xAry.length).tickValues(capAry);  //orient bottom because x-axis tick labels will appear on the
    .orient('bottom').ticks(xAry.length)
    .tickFormat(function (d) {
      if (level == 0) {
        const mapper = options[0].captions[0]
        return mapper[d]
      } else {
        const r = runningData[ctrtxt].caption
        ctrtxt += 1
        return r
      }
    })

  const yAxis = d3.svg.axis()
    .scale(y)
    .orient('left').ticks(5) // orient left because y-axis tick labels will appear on the left side of the axis.

  bar.append('rect')
    .attr('y', function (d) {
      return y(d.Total) + margin.top - 15
    })
    .attr('x', function (d) {
      return (margin.left)
    })
    .on('mouseenter', function (d) {
      d3.select(this)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('height', function (d) {
          return height - y(d[yVarName]) + 5
        })
        .attr('y', function (d) {
          return y(d.Total) + margin.top - 20
        })
        .attr('width', x.rangeBand() + 10)
        .attr('x', function (d) {
          return (margin.left - 5)
        })
        .transition()
        .duration(200)
    })
    .on('mouseleave', function (d) {
      d3.select(this)
        .attr('stroke', 'none')
        .attr('height', function (d) {
          return height - y(d[yVarName])
        })
        .attr('y', function (d) {
          return y(d[yVarName]) + margin.top - 15
        })
        .attr('width', x.rangeBand())
        .attr('x', function (d) {
          return (margin.left)
        })
        .transition()
        .duration(200)
    })
    .on('click', function (d) {
      if (this._listenToEvents) {
        // Reset inmediatelly
        d3.select(this).attr('transform', 'translate(0,0)')
        // Change level on click if no transition has started
        path.each(function () {
          this._listenToEvents = false
        })
      }
      d3.selectAll('#' + id + ' svg').remove()
      if (level == 1) {
        TransformChartData(chartData, options, 0, d[xVarName])
        BuildBar(id, chartData, options, 0)
      } else {
        const nonSortedChart = chartData.sort(function (a, b) {
          return parseFloat(b[options[0].yaxis]) - parseFloat(a[options[0].yaxis])
        })
        TransformChartData(nonSortedChart, options, 1, d[xVarName])
        BuildBar(id, nonSortedChart, options, 1)
      }
    })

  bar.selectAll('rect').attr('height', function (d) {
    return height - y(d[yVarName])
  })
    .transition().delay(function (d, i) { return i * 300 })
    .duration(1000)
    .attr('width', x.rangeBand()) // set width base on range on ordinal data
    .transition().delay(function (d, i) { return i * 300 })
    .duration(1000)

  bar.selectAll('rect').style('fill', function (d) {
    return rcolor(d[xVarName])
  })
    .style('opacity', function (d) {
      return d.op
    })

  bar.append('text')
    .attr('x', x.rangeBand() / 2 + margin.left - 10)
    .attr('y', function (d) { return y(d[yVarName]) + margin.top - 25 })
    .attr('dy', '.35em')
    .text(function (d) {
      return d[yVarName]
    })

  bar.append('svg:title')
    .text(function (d) {
      // return xVarName + ":  " + d["title"] + " \x0A" + yVarName + ":  " + d[yVarName];
      return d.title + ' (' + d[yVarName] + ')'
    })

  chart.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top - 15) + ')')
    .call(xAxis)
    .append('text')
    .attr('x', width)
    .attr('y', -6)
    .style('text-anchor', 'end')
  // .text("Year");

  chart.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + margin.left + ',' + (margin.top - 15) + ')')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
  // .text("Sales Data");

  if (level == 1) {
    chart.select('.x.axis')
      .selectAll('text')
      .attr('transform', ' translate(-20,10) rotate(-35)')
  }
}

function TransformChartData (chartData, opts, level, filter) {
  const result = []
  const resultColors = []
  let counter = 0
  let hasMatch
  let xVarName
  const yVarName = opts[0].yaxis

  if (level == 1) {
    xVarName = opts[0].xaxisl1

    for (var i in chartData) {
      hasMatch = false
      for (var index = 0; index < result.length; ++index) {
        var data = result[index]

        if ((data[xVarName] == chartData[i][xVarName]) && (chartData[i][opts[0].xaxis]) == filter) {
          result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName]
          hasMatch = true
          break
        }
      }
      if ((hasMatch == false) && ((chartData[i][opts[0].xaxis]) == filter)) {
        if (result.length < 9) {
          ditem = {}
          ditem[xVarName] = chartData[i][xVarName]
          ditem[yVarName] = chartData[i][yVarName]
          ditem.caption = chartData[i][xVarName].substring(0, 10) + '...'
          ditem.title = chartData[i][xVarName]
          ditem.op = 1.0 - parseFloat('0.' + (result.length))
          result.push(ditem)

          resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]]

          counter += 1
        }
      }
    }
  } else {
    xVarName = opts[0].xaxis

    for (var i in chartData) {
      hasMatch = false
      for (var index = 0; index < result.length; ++index) {
        var data = result[index]

        if (data[xVarName] == chartData[i][xVarName]) {
          result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName]
          hasMatch = true
          break
        }
      }
      if (hasMatch == false) {
        ditem = {}
        ditem[xVarName] = chartData[i][xVarName]
        ditem[yVarName] = chartData[i][yVarName]
        ditem.caption = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : ''
        ditem.title = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : ''
        ditem.op = 1
        result.push(ditem)

        resultColors[counter] = opts[0].color != undefined ? opts[0].color[0][chartData[i][xVarName]] : ''

        counter += 1
      }
    }
  }

  runningData = result
  runningColors = resultColors
}
/** This is the data for the bar chart, each country has a sub list of elements that constitutes it. */

var chartData = [
  {
    Country: 'USA',
    Model: 'Transportation',
    Total: 1453.39
  },
  {
    Country: 'USA',
    Model: 'Electricity',
    Total: 1252.92
  },
  {
    Country: 'USA',
    Model: 'Industry',
    Total: 1152.68
  },
  {
    Country: 'USA',
    Model: 'Commercial & Residential',
    Total: 651.52
  },
  {
    Country: 'USA',
    Model: 'Agriculture',
    Total: 501.10
  },

  {
    Country: 'China',
    Model: 'Transportation',
    Total: 834.62
  },
  {
    Country: 'China',
    Model: 'Electricity',
    Total: 4173.10
  },
  {
    Country: 'China',
    Model: 'Industry',
    Total: 5216.38
  },

  {
    Country: 'UK',
    Model: 'Transportation',
    Total: 99.32
  },
  {
    Country: 'UK',
    Model: 'Electricity',
    Total: 77.25
  },
  {
    Country: 'UK',
    Model: 'Industry',
    Total: 62.54
  },
  {
    Country: 'UK',
    Model: 'Commercial & Residential',
    Total: 55.18
  },

  {
    Country: 'UK',
    Model: 'Agriculture',
    Total: 36.79
  }
]
/** Selecting the colour for the bar chart */
chartOptions = [{
  captions: [{ China: 'China', UK: 'UK', USA: 'USA' }],
  color: [{ China: '#FFA500', UK: '#0070C0', USA: '#ff0000' }],
  xaxis: 'Country',
  xaxisl1: 'Model',
  yaxis: 'Total'
}]

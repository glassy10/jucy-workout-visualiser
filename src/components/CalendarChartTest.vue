<template>
  <div>
    calendar view here
    <div id="calendarcharttest"></div>
  </div>
</template>

<script>
// var sql = require('../../static/sql.js')
// https://github.com/kripken/sql.js
var d3 = require('d3')
var d3Time = require('d3-time')
import Utilities from '@/components/utils/Utilities'

export default {
  name: 'calendartest',
  data () {
    return {
    }
  },
  methods: {
  },
  created: function () {
    doChart()
  }
}

function doChart() {
var width = 960,
    height = 136,
    cellSize = 17;

var formatPercent = d3.format(".1%");

var color = d3.scaleQuantize()
    .domain([-0.05, 0.05])
    .range(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"]);

var svg = d3.select("#calendarcharttest")
  .selectAll("svg")
  .data(d3.range(1990, 2011))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return d; });

var rect = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
  .selectAll("rect")
  .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("rect")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize; })
    .attr("y", function(d) { return d.getDay() * cellSize; })
    .datum(d3.timeFormat("%Y-%m-%d"));

svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#000")
  .selectAll("path")
  .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("d", pathMonth);

d3.csv("../static/dji.csv", function(error, csv) {
  if (error) throw error;

  var data = d3.nest()
      .key(function(d) { return d.Date; })
      .rollup(function(d) { return (d[0].Close - d[0].Open) / d[0].Open; })
    .object(csv);
    //console.log('data',JSON.stringify(data))

    //{"2010-10-01":0.0037035252073270622,"2010-09-30":-0.0044213895215559915,"2010-09-29":-0.002090628275240782,"2010-09-28":0.004467222024357327,"2010-09-27":-0.004418956485387221,"2010-09-24":0.018366732649499954,"2010-09-23":-0.007082939112425548,"2010-09-22":-0.00202581332223173,"2010-09-21":0.0007104736273864556,"2010-09-20":0.013719730620432809,"2010-09-17":0.0011712585791623428,"2010-09-16":0.0021831768628656494,"2010-09-15":0.004399406445876137,...}
  rect.filter(function(d) { return d in data; })
      .attr("fill", function(d) { return color(data[d]); })
    .append("title")
      .text(function(d) { return d + ": " + formatPercent(data[d]); });
});

function pathMonth(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
      d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

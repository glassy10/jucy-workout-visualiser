<template>
  <div>

    <h3>Workouts <small style="font-size:13px">Click day to view workout</small></h3>
    <div id="chartqwer"></div>
  </div>
</template>

<script>
// var sql = require('../../static/sql.js')
// https://github.com/kripken/sql.js
var d3 = require('d3')
var d3Time = require('d3-time')
import Utilities from '@/components/utils/Utilities'
import router from '../router/'
import Store from '@/components/Store'

export default {
  name: 'chart-calendar-view',
  components:{
    router
  },
  props: {
    data:Array
  },
  data () {
    return {
      state: Store.state,
      debug: false,
    }
  },

  methods: {
    getData: function () {
      var vm = this
      if (vm.data.length > 0) {
        var workouts = vm.data
        var chartData = []
        //console.log('calendar-view get data - workouts',workouts)
        workouts.forEach(function(item,index){
          chartData[workouts[index].fDate] = {
            length:item.workoutLength,
            id:item.id,
            name:item.name
          }
        })
        vm.drawChart(chartData)
      }
    },
    drawChart: function(chartData) {
      //console.log('drawChart method says chartData is',chartData)
      //d3.select("#calendar-view").remove();
      var width = 656, //was 960
          height = 90, //was 136
          cellSize = 12; //was 17

      var formatPercent = d3.format(".1%");
      var color = d3.scaleQuantize()
        .domain([0, 120])
        //.range(d3.schemeCategory10 );
        .range(["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"]);

      var svg = d3.select("#chartqwer")//#chartcalendarview
        .selectAll("svg")
        .data(d3.range(2016, 2018))
        .enter().append("svg")
          //.attr("id","calendar-view")
          .attr("width", width)
          .attr("height", height)
          //.attr("transform","rotate(90)") //***NEW***
        .append("g")
          //.attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")")
          .attr("transform", "translate(0," + (height - cellSize * 7 - 1) + ")")


      svg.append("text")
          //.attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
          .attr("transform", "translate("+ (+width - 12) + "," + cellSize * 3.5 + ")rotate(90)")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "middle")
          .text(function(d) { return d; });

      var rect = svg.append("g")
          .attr("fill", "#eee")
          .attr("stroke", "#fff")
          .attr("stroke-width", "2px")
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
          .attr("stroke", "#ddd")
          .attr("stroke-width", "1px")
        .selectAll("path")
        .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append("path")
          .attr("d", pathMonth);

      rect.filter(function(d) { return d in chartData; })
          .attr("fill", function(d) { return color(chartData[d].length); })
          .on('click', function(d) {
             //send user to workout detail.. using chartData[d].id
             router.push({ path: '/workout/' + chartData[d].id })
           })
           .attr("class","workout-date")
          .append("title")
            .text(function(d) { return d + ": " + chartData[d].name + ", " + chartData[d].length + " mins"; });

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
  },
  watch: {
    data:function(newValue){
      this.debug && console.log('calendar chart watch triggered')
      this.getData()
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.workout-date {
  cursor:pointer;
}
</style>

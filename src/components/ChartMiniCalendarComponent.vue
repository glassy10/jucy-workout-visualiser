<template>
  <div>
    <h3>Workouts <small style="font-size:13px">Click day to view workout</small></h3>
    <div id="chartqwer2"></div>
  </div>
</template>

<script>
var d3 = require('d3')
var d3Time = require('d3-time')
import Utilities from '@/components/utils/Utilities'
import router from '../router/'
import Store from '@/components/Store'

export default {
  name: "testComponent",
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
      this.debug && console.log('drawChart method says chartData is',chartData)
      // d3.select("svg").remove();
      var width = 320, //was 960
          height = 190, //was 136
          cellSize = 20; //was 17

      var formatPercent = d3.format(".1%");
      var color = d3.scaleQuantize()
        .domain([0, 120])
        //.range(d3.schemeCategory10 );
        .range(["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"]);

      //work out some relevant dates...
      var numberOfMonthsToDisplay = 3
      var today = new Date()
      var dataYear = today.getFullYear() //TODO maybe this should be dynamic to latest year represented in workout data
      var priorMonthStart = new Date(dataYear,today.getMonth()-(numberOfMonthsToDisplay)+1,1)
      var currentMonthEnd = new Date(dataYear,today.getMonth()+1,0)
      var startingWeeksToDiscard = d3.timeWeek.count(new Date(dataYear,0,1),priorMonthStart)
      var days = ["S","M","T","W","T","F","S"]
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
      var displayedMonths = months.slice(priorMonthStart.getMonth(),priorMonthStart.getMonth() + numberOfMonthsToDisplay)

      var svg = d3.select("#chartqwer2")
        .selectAll("svg")
        .data(d3.range(dataYear,dataYear+1))
        .enter().append("svg")
          //.attr("id","calendar-view")
          .attr("width", width)
          .attr("height", height)
          //.style("border","1px solid red")
         .append("g")
           .attr("transform", "translate(" + cellSize + "," + cellSize + ")")

      //add day labels
      svg.selectAll("text.dayLabel")
        .data(days)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x",  -cellSize*2/3 )
        .attr("y", function (d,i) { return (i * cellSize) + cellSize*2/3 ; })
        .text(function (d) { return d; });

        //add month labels
        svg.selectAll("text.mthLabel")
          .data(displayedMonths)
          .enter()
          .append("text")
          .attr("class", "label")
          .attr("x",  function (d,i) { return (i * (cellSize*4.33)) + cellSize*2 ; } )
          .attr("y", -cellSize/3)
          .text(function (d) { return d; });

      //draw grey rects for every day - we only want to do this for the current & prior months
      var rect = svg.append("g")
          .attr("fill", "#eee")
          .attr("stroke", "#fff")
          .attr("stroke-width", "2px")
        .selectAll("rect")
        .data(function(d) {
          return d3.timeDays(priorMonthStart, currentMonthEnd);
         })
        .enter().append("rect")
          .attr("width", cellSize)
          .attr("height", cellSize)
           .attr("x", function(d) {
              return (d3.timeWeek.count(d3.timeYear(d), d) -startingWeeksToDiscard) * cellSize; //TODO the 12 needs to be dynamic
            })
           .attr("y", function(d) { return d.getDay() * cellSize; })
          .datum(d3.timeFormat("%Y-%m-%d"));

      //fill rects with events with color
      rect.filter(function(d) { return d in chartData; })
          .attr("fill", function(d) { return color(chartData[d].length); })
          .on('click', function(d) {
             //send user to workout detail.. using chartData[d].id
             router.push({ path: '/workout/' + chartData[d].id })
           })
           .attr("class","workout-date")
          .append("title")
            .text(function(d) { return d + ": " + chartData[d].name + ", " + chartData[d].length + " mins"; });

    }
  },
  watch: {
    data:function(newValue){
      this.debug && console.log('mini-calendar watch triggered')
      this.getData()
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.label {
  font-family:"Segoe UI",Helvetica,sans-serif;
  font-size:11px
}
</style>

<template>
  <div>
    MINI!!

    <div id="chartqwer2"></div>
    <h6>
      <small><router-link to="" class="float-right" >View all</router-link></small>
      Recent Workouts
    </h6>
    <div v-for="workout in limitWorkouts" style="padding:2px 0 4px 0;border-bottom:1px solid #ddd">
      <small>{{niceDate(workout.fDate)}} &nbsp;&nbsp; ({{workout.workoutLength}} mins)</small>
      <br/>
      <router-link :to="{ path: '/workout/' + workout.id }">
       {{workout.name}}
      </router-link>
    </div>

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
  computed: {
    limitWorkouts:function(){
      return this.state.workouts.slice().reverse().slice(0,4)
    }

  },
  methods: {
    niceDate:function(date){ //'2017-04-22'
      var day = date.substring(8,10)
      var month = date.substring(5,7)
      var year = date.substring(0,4)
      return day + "/" + month + "/" + year
    },
    getData: function () {
    console.log('getData triggered')
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
      console.log('drawChart method says chartData is',chartData)
      // d3.select("svg").remove();
      var width = 960, //was 960
          height = 136, //was 136
          cellSize = 17; //was 17

      var formatPercent = d3.format(".1%");
      var color = d3.scaleQuantize()
        .domain([0, 120])
        //.range(d3.schemeCategory10 );
        .range(["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"]);

      var svg = d3.select("#chartqwer2")
        .selectAll("svg")
        .data(d3.range(2017, 2018))
        .enter().append("svg")
          //.attr("id","calendar-view")
          .attr("width", width)
          .attr("height", height)
          //.attr("transform","rotate(90)") //***NEW***
        .append("g")
          .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")")


      svg.append("text")
          .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
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
      console.log('mini-calendar watch triggered')
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

<template>
  <div>
    <p>chartexercise start</p>
    <div id="chartexercise"></div>

    <a href="" @click.prevent="toggleData()">Show/hide data</a>
    <div v-if="showSetsData">
      <div class="row">
        <div class="md-col-6">
          <table class="table table-sm">
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Reps</th>
              <th>Reps x Wt</th>
              <!-- <th>Results_id</th> -->
            </tr>
            <tr v-for="w in workouts">
              <td>{{w.fDate}}</td>
              <td class="text-right">{{w.weight.toFixed(1)}}</td>
              <td class="text-right">{{w.reps}}</td>
              <td class="text-right">{{w.totalWeight.toFixed(1)}}</td>
              <!-- <td>{{w.results_id}}</td> -->
            </tr>
          </table>
        </div>
        <div class="md-col-6">
        </div>
      </div>
    </div>
    <p>chartexercise end</p>

  </div>
</template>

<script>
// var sql = require('../../static/sql.js')
// https://github.com/kripken/sql.js
var d3 = require('d3')
var d3Time = require('d3-time')
var d3Color = require('d3-color')
import Utilities from '@/components/utils/Utilities'
import Store from '@/components/Store'
import router from '../router/'

export default {
  name: 'exovis',
  components:{
    router
  },
  props:{
    exerciseId: Number,
    hideSets: Boolean,
    startDate: {
      default: 1483535523224,
      type: Number
    }
  },
  data () {
    return {
      state: Store.state,
      workouts:[],
      showSetsData:false,
      sqlData:[],
      debug: true
    }
  },
  methods: {
    toggleData: function() {
      this.showSetsData = !this.showSetsData
    },
    getData: function (forceUpdate) {
      var vm = this
      if (vm.sqlData.length < 1 || forceUpdate) {
        vm.debug && console.log('getData is getting data')
        Utilities.loadBinaryFile(vm.state.jucyFileURL, function (data) {
          //eslint-disable-next-line
          var db = new SQL.Database(data)
          var sqlStr = 'select "exercise_sets".value, "measure_units".unit, "unit_types".desc, "workouts".date as date, "exercises".id as "ex_id", "exercises".name, "exercise_results".workout_id, "exercise_results".id as "results_id"'
          sqlStr +=	'from "exercise_sets" inner join "measure_units" on "exercise_sets".measure_id = "measure_units".id '
          sqlStr +=	'inner join "unit_types" on "measure_units".unit_id = "unit_types".id '
          sqlStr +=	'inner join "exercise_results" on "exercise_sets".result_id = "exercise_results".id '
          sqlStr +=	'inner join "workouts" on "exercise_results".workout_id = "workouts".id '
          sqlStr +=	'inner join "exercises" on "exercise_results".exercise_id = "exercises".id '
          sqlStr +=	'where "exercises".id = ' + vm.exerciseId + ' '
          sqlStr +=	'and date >= ' + vm.startDate + ' '
          sqlStr +=	'order by date'
          //vm.debug && console.log('getData - sql string is',sqlStr)
          var sqlWorkouts = db.exec(sqlStr)
          vm.sqlData = Utilities.sqlJsonify(sqlWorkouts);
          //vm.debug && console.log('getData passes sqlData to processData', JSON.stringify(vm.sqlData))
          vm.processData()
        })
      } else {  //already have data so just go & process it
        vm.processData()
      }
    },
    processData: function(){
      var vm = this
      var tmpData = vm.sqlData



      //remap data so we get array of arrays
      const series = [...new Set(tmpData.map(item => item.unit))];
      vm.debug && console.log('series',series)
      vm.debug && console.log('tmpData',JSON.stringify(tmpData))
      var measurements = series.map(function(item) {
        return {
         id: item,
          values: tmpData.filter(function(val){
              return val.unit === item
            }).map(function(d) {
            return {date: d.date, measurement: d.value};
          })
        }
      });

      // vm.debug && console.log('final result from processData (hideSets=false): ',JSON.stringify(measurements))

      if (vm.hideSets) {
        newData = newData.reduce(function(res, obj) {
            if (!(obj.date in res))
                res.__array.push(res[obj.date] = obj);
            else {
                res[obj.date].weight += obj.weight;
                res[obj.date].reps += obj.reps;
                res[obj.date].totalWeight += obj.totalWeight;
            }
            return res;
        }, {__array:[]}).__array;
        //vm.debug && console.log('final result from processData (hideSets=true): ',JSON.stringify(newData))
      }

      //vm.workouts = newData
      drawChart(measurements,true)
      //drawMonthlyChart(newData)
    }
  },
  watch: {
    exerciseId: function (newValue) {
      this.debug && console.log('watch - exerciseId', newValue)
      this.getData(true)
    },
    hideSets: function (newValue) {
      this.debug && console.log('watch - hideSets', newValue)
      this.getData(false) //? this is just reprocessing same data
    },
    startDate: function(newValue){
      this.debug && console.log('watch - startDate',newValue)
      this.getData(true)
    }
  },
  created: function () {
    this.getData(true)
    this.debug && console.log('created - this.exerciseId: ',this.exerciseId)

  }
}

  function drawChart(measurements,debug) {
    console.log('measurements',JSON.stringify(measurements))
    d3.select("svg").remove();

    //var xAxisField = "date" //TODO ??
    var margin = {top: 20, right: 50, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);
    // define the line
    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.measurement); });

    //gridlines
    // gridlines in x axis function
    function makeXgridlines() {
        return d3.axisBottom(x)
            .ticks(5)
    }
    // gridlines in y axis function
    function makeYgridlines() {
      return d3.axisLeft(y).ticks(5)
    }

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#chartexercise").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var maxValue = d3.max(measurements, function(d) { return d3.max(d.values, function(m){return +m.measurement}) })
    console.log('maxValue',maxValue)
    x.domain(d3.extent(measurements[0].values, function(d) { return d.date; }));
    y.domain([0, maxValue]);
    z.domain(measurements.map(function(d) { return d.id; }));


    var measure = g.selectAll(".measure")
      .data(measurements)
      .enter().append("g")
        .attr("class", "measure");

    measure.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

    measure.append("text")
          .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.measurement) + ")"; })
          .attr("x", 3)
          .attr("dy", "0.35em")
          .style("font", "10px sans-serif")
          .text(function(d) { return d.id; });

    var radiusIncrement = 4
    var counter = radiusIncrement
    var lastDate = new Date(measurements[0].values[0].date)

    g.selectAll("g.dot")
      .data(measurements)
        .enter().append("g")
          .attr("class", "y2dot")
          .style("stroke", function(d) { return z(d.id); })
          .style("fill", "none" )
          .style("stroke-width", "1px" )
      .selectAll("circle")
      .data(function(d) { return d.values; })
        .enter().append("circle")
          .attr("r",  function(d){
            var dat = new Date(d.date)
            if (dat.getTime() !== lastDate.getTime() ) {
              //console.log('in da !== loop',+d.measurement,lastMeasurement)
              lastDate = new Date(d.date)
              counter = radiusIncrement
              return radiusIncrement;
            } else {
              //console.log('in da other loop')
              lastDate = new Date(d.date)
              counter += radiusIncrement
              return counter
            }
          })
          .attr("cx", function(d,i) { return x(d.date); })
          .attr("cy", function(d,i) { return y(d.measurement); })


    // Add the X Axis
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));


    // Add the y Axis
    g.append("g")
        .attr("class", "axisSteelBlue")
        //.attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisLeft(y).ticks(6))
        .append("text")
          .attr("class", "y0title")
          .attr("transform", "rotate(-90)")
          .attr("x",-height/2)
          .attr("y", 6)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("text here");



    // add the X gridlines
    g.append("g")
        .attr("class", "xGrid")
        .attr("transform", "translate(0," + height + ")")
        .call(makeXgridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    // add the Y0 gridlines
    g.append("g")
         .attr("class", "y0grid")
         .call(makeYgridlines()
             .tickSize(-width)
             .tickFormat("")
         )
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.line {
  stroke: rgb(130,180,70);
  fill: none;
  stroke-width: 2px;
  opacity:.25;
}
.line-weight, .line-reps, .line-total-weight {
  fill: none;
  stroke-width: 2px;
}
.line-weight, .y0grid line, .y0grid path {
  stroke: rgb(70,130,180); /*#4682B4*/
}
.bar {
  fill: rgb(70,130,180);
}

.line-reps, .y1grid line,.y1grid path {
  stroke: rgb(130,180,70) /*#82b446;*/
}
.line-total-weight,.y2grid line,.y2grid path {
  stroke: rgb(180,70,130) /*#b44682;*/
}
.axisSteelBlue text, .y0dot {
  fill: #25455f /*steelblue;*/
}
.axisRed text, .y1dot {
  fill: #455f25;/*#82b446;*/
}
.axisGreen text, .y2dot {
  fill: #5f2545 /*#b44682;*/
}

.y0grid line {
  stroke-opacity: 0.3;
  shape-rendering: crispEdges;
}
 .y0grid path,.y1grid path,.y2grid path  {
   stroke-opacity: 0.0;
 }

.y1grid line {
  stroke-opacity: 0.3;
  shape-rendering: crispEdges;
}
.y2grid line {
  stroke-opacity: 0.3;
  shape-rendering: crispEdges;
}
.xGrid line {
  stroke: black;
  stroke-opacity: 0.1;
  shape-rendering: crispEdges;
}
.y0title {
  font-size:13px;
  color:steelblue
}
.y1title {
  font-size:13px;
  color:#82b446
}
.y2title {
  font-size:13px;
  color:#b44682
}
.overlay {
  fill: none;
  pointer-events: all;
}

.focus circle {
  fill: #F1F3F3;
  stroke: #6F257F;
  stroke-width: 5px;
}

.hover-line {
  opacity:0.3;
  stroke: #999999;
  stroke-width: 10px;
  /*stroke-dasharray: 3,3;*/
}
</style>

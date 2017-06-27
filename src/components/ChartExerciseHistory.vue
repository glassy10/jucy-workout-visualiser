<template>
  <div>
    <div id="chart-exercise-history"></div>


    <div class="row">
      <div class="col-md-6">

        <chart-scatter :data="repsWeightData"></chart-scatter>

      </div>
      <div class="col-md-6">
        <a href="" @click.prevent="toggleData()">Show/hide data</a>
        <div v-if="showSetsData">
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
      </div>
    </div>
  </div>
</template>

<script>
var d3 = require('d3')
var d3Time = require('d3-time')
var d3Color = require('d3-color')
import Store from '@/components/Store'
import Utilities from '@/components/utils/Utilities'
import router from '../router/'
import ChartScatter from '@/components/ChartScatter'
export default {
  name: 'chart-exercise-history',
  components:{
    router, Utilities,ChartScatter
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
      repsWeightData:[],
      debug: false,

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
      const series = [...new Set(tmpData.map(item => item.unit))].sort();
      //vm.debug && console.log('series',series)
      //vm.debug && console.log('tmpData',JSON.stringify(tmpData))
      var measurements = series.map(function(item) {
        return {
          id: item,
          values: tmpData.filter(function(val){
              return val.unit === item
            }).map(function(d) {
            return { date: d.date, measurement: d.value };
          })
        }
      });

      //add total weight series if we only have reps * weight
      if (measurements.length === 2) {
        var totalWeights = {
          id:"Total weight",
          values : []
        }
        //measurements.forEach(function(item,index){
          measurements[0].values.forEach(function(ite,ind){
            var obj = {}
            obj.date = ite.date
            obj.measurement = ite.measurement * measurements[1].values[ind].measurement
            totalWeights.values.push(obj)
          })
        //})
        measurements.push(totalWeights)
      }
      vm.repsWeightData = measurements


      //vm.workouts = newData
      drawChart(measurements,vm.debug)
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
    debug && console.log('measurements',JSON.stringify(measurements))
    d3.select("svg").remove();

    var margin = {top: 20, right: 50, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#chart-exercise-history").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set the x & z ranges
    var x = d3.scaleTime().range([0, width]);
    x.domain(d3.extent(measurements[0].values, function(d) { return d.date; }));
    var z = d3.scaleOrdinal(d3.schemeCategory10);
    z.domain(measurements.map(function(d) { return d.id; }));

    // define the line
    function line (yScale) {
      return d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return yScale(d.measurement); });
    }
    //gridlines
    // gridlines in x axis function
    function makeXgridlines() {
        return d3.axisBottom(x)
            .ticks(5)
    }

    // gridlines in y axis function
    function makeYgridlines(yScale) {
      return d3.axisLeft(yScale).ticks(5)
    }

    var countSeries = measurements.length

    measurements.forEach(function(item,index){
      var chartGap = 15
      var chartTop = height * (index+1)/countSeries
      var chartBottom = (height * index/countSeries) + chartGap

      var y = d3.scaleLinear().range([chartTop, chartBottom])
      var minValue = d3.min(item.values, function(d) {return +d.measurement})
      var maxValue = d3.max(item.values, function(d) {return +d.measurement})
      y.domain([minValue-(minValue*.25), maxValue+(maxValue*.25)]);

      //draw coloured background rectangles
      g.append("rect")
        .attr("x",0)
        .attr("y",chartBottom)
        .attr("width",width)
        .attr("height",(height/countSeries)-chartGap)
        .style("fill",function(d){return z(index)})
        .attr("opacity","0.15")

      var mLine = g.append("path")
          .data([item.values])
          .attr("class", "line")
          .style("stroke", function(d) { return z(index); })
          .attr("d", line(y));


      var radiusIncrement = 4
      var counter = radiusIncrement
      var lastDate = new Date(item.values[0].date)
      g.selectAll("g.dot")
        .data(item.values)
          .enter().append("circle")
            .attr("class", "y2dot")
            .style("stroke", function(d) { return z(index); })
            .style("fill", "none" )
            .style("stroke-width", "2px" )
            .attr("r",
              function(d){
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

      //add l/h blanking rect
       g.append("rect")
         .attr("x",-margin.left)
         .attr("y",chartBottom)
         .attr("width",margin.left)
         .attr("height",(chartTop-chartBottom))
         .style("fill","white")

        //add r/h blanking rect
        g.append("rect")
          .attr("x",width)
          .attr("y",chartBottom)
          .attr("width",margin.right)
          .attr("height",(chartTop-chartBottom))
          .style("fill","white")

        //add labels to lines
        g.append("text")
          .attr("transform", function(d) {
             return "translate(" + x(item.values[0].date) + "," + (chartBottom + 20) + ")";
            })
          .attr("x", 10)
          .attr("dy", "0.35em")
          .attr("class","measureLbl")
          .style("stroke", function(d){return z(index)})
          .style("fill", function(d){return z(index)})
          .text(function(d) { return item.id.toUpperCase(); });

         // Add the y Axis
       g.append("g")
           .attr("class", "yAxisTicks")
           .attr("stroke", function(d){return z(index)})
           //.attr("transform", "translate( " + width + ", 0 )")
           .call(d3.axisLeft(y).ticks(6))


       // add the Y gridlines
       g.append("g")
            .attr("class", "yGrid")
            //.attr("stroke", function(d){return z(index)})
            .call(makeYgridlines(y)
                .tickSize(-width)
                .tickFormat("")
            )


    })

    // Add the X Axis
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the X gridlines
    g.append("g")
        .attr("class", "xGrid")
        .attr("transform", "translate(0," + height + ")")
        .call(makeXgridlines()
            .tickSize(-height)
            .tickFormat("")
        )

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.yAxisTicks {
  font-family: Roboto,sans-serif;
  font-size: 12px;
  shape-rendering: crispEdges;
}
.measureLbl {
  font-family: Roboto,sans-serif;
  font-size: 24px;
  shape-rendering: crispEdges;
}

.line {
  stroke: rgb(130,180,70);
  fill: none;
  stroke-width: 5px;
  opacity:.25;
}

.yGrid  line {
  stroke-opacity: 0.1;
  shape-rendering: crispEdges;
}
.yGrid path {
  stroke-opacity: 0.2;
  stroke-width:1px;
  shape-rendering: crispEdges;
}
.xGrid line {
  stroke: #000;
  stroke-opacity: 0.1;
  shape-rendering: crispEdges;
}


</style>

<template>
  <div>
    <div id="chart-exercise-sets"></div>

    <div id="chart-monthly-totals"></div>

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

  </div>
</template>

<script>
// var sql = require('../../static/sql.js')
// https://github.com/kripken/sql.js
var d3 = require('d3')
var d3Time = require('d3-time')
import Utilities from '@/components/utils/Utilities'
import Store from '@/components/Store'
import router from '../router/'

export default {
  name: 'chart-exercise-sets',
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
      debug:false
    }
  },
  methods: {
    toggleData: function() {
      this.showSetsData = !this.showSetsData
    },
    getData: function (forceUpdate) {
      var vm = this
      if (vm.sqlData.length < 1 || forceUpdate) {
        vm.debug && console.log('getting data')
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
          vm.debug && console.log('sqlStr',sqlStr)
          var sqlWorkouts = db.exec(sqlStr)
          vm.sqlData = Utilities.sqlJsonify(sqlWorkouts);
          vm.processData()
        })
      } else {  //already have data so just go & process it
        vm.processData()
      }
    },
    processData: function(){
      var vm = this
      var tmpData = vm.sqlData
      var formatDate = d3.timeFormat("%d-%m-%Y");

      //console.log('vm.workouts',JSON.stringify(vm.workouts))
      // {"value":"24","unit":"Weight",
      // "desc":"kilograms","date":1489685841688,
      // "ex_id":98,"name":"Dumbbell incline bench press",
      // "workout_id":443,"results_id":10134,"fDate":"16-03-2017"},
      //need to split data to two line series...weight & reps
      //then need to figure out how to show several sets on same day
      var weights = []
      var reps = []
      tmpData.forEach(function(item,index){
        item.fDate = formatDate(item.date)
        if (item.unit === "Weight") {
          var obj = {}
          obj.weight = +item.value
          obj.date = new Date(item.date)
          obj.fDate = item.fDate
          obj.results_id = item.results_id
          weights.push(obj)
        } else if (item.unit === "Reps"){
          var obj = {}
          obj.reps = +item.value
          obj.date = new Date(item.date)
          obj.fDate = item.fDate
          obj.results_id = item.results_id
          reps.push(obj)
        }
      })

      var newData = []
      //now merge them (ASSUMPTION - that there are jsut two measures - weight & reps)...could be using results_id
      for (var i = 0;i < weights.length; i++){
        var newObj = Utilities.mergeObjs(weights[i],reps[i]);
        newObj.totalWeight = +(newObj.reps * newObj.weight)
        newData.push(newObj);
      }

      vm.debug && console.log('newData',JSON.stringify(newData))

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
        vm.debug && console.log('result',JSON.stringify(newData))
      }


      vm.workouts = newData
      drawChart(newData,this.debug)
      drawMonthlyChart(newData,this.debug)
    }
  },
  watch: {
    exerciseId: function (newValue) {
      this.getData(true)
    },
    hideSets: function (newValue) {
      this.getData(false) //this is just reprocessing same data
    },
    startDate: function(newValue){
      this.debug && console.log('startDate change')
      this.getData(true)
    }
  },
  created: function () {
    this.getData(true)
    this.debug && console.log('this.exerciseId',this.exerciseId)
  }
}
function drawMonthlyChart(data,debug) {
  d3.select("#monthly-chart").remove();
  //bar chart summarising totals by month
  var grouped = d3.nest()
    .key(function(d) { return d.fDate.substring(3,10);})
    .rollup(function(d) {
      return d3.sum(d, function(g) {return g.totalWeight; });
  }).entries(data);
  debug && console.log('grouped',grouped)

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 500 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
  var y = d3.scaleLinear()
            .range([height, 0]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#chart-monthly-totals").append("svg")
      .attr("id","monthly-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    x.domain(grouped.map(function(d) { return d.key; }));
    y.domain([0, d3.max(grouped, function(d) { return d.value; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(grouped)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.key); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

}

  function drawChart(data,debug) {

    d3.select("svg").remove();

    var xAxisField = "date"
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

    // parse the date / time
    //var parseTime = d3.timeParse("%d-%b-%y");
    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    //var x = d3.scaleBand().rangeRound([0, width]).padding(0.02);
    var y0 = d3.scaleLinear().range([height/3*2, height/3]);
    var y1 = d3.scaleLinear().range([height, height/3*2]);
    var y2 = d3.scaleLinear().range([height/3, 0]);

    var countIncrement = 5
    var startCounter = countIncrement
    var lastDate = data[0].date
    var counter = startCounter
    //this function is for showing sets separately
    //if a set is on same date as previous one then
    //the line is nudged on by countIncrement pixels
    function drawLine(yField, yAxisFn) {
      return  d3.line().x(function(d) {
        if (d.date.getTime() !== lastDate.getTime()) {
          counter = startCounter
          var result = x(d[xAxisField])
          lastDate = d.date
          return result
        } else {
          lastDate = d.date
          var result = x(d[xAxisField]) + counter
          counter += countIncrement
          return result
        }
      })
      .y(function(d) { return yAxisFn(d[yField]); });
    }
    var weightline = drawLine('weight',y0);

    counter = startCounter
    var repsLine =  drawLine('reps',y1);

    counter = startCounter
    var totalWeightLine = drawLine('totalWeight',y2);

    //gridlines
    // gridlines in x axis function
    function makeXgridlines() {
        return d3.axisBottom(x)
            .ticks(5)
    }
    // gridlines in y axis function
    function makeY0gridlines() {
      return d3.axisLeft(y0).ticks(5)
    }

    function makeY1gridlines() {
      return d3.axisLeft(y1).ticks(5)
    }

    function makeY2gridlines() {
      return d3.axisLeft(y2).ticks(5)
    }

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#chart-exercise-sets").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //create group for the focus thing...
    var fg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var axesPadding = 1.1
    var maxWeight = d3.max(data, function(d) { return d.weight; }) * axesPadding
    var maxReps = d3.max(data, function(d) { return d.reps; }) * axesPadding
    var maxTotal = d3.max(data, function(d) { return d.totalWeight; }) * axesPadding
    var minWeight = d3.min(data, function(d) { return d.weight; }) / axesPadding
    var minReps = d3.min(data, function(d) { return d.reps; }) / axesPadding
    var minTotal = d3.min(data, function(d) { return d.totalWeight; }) / axesPadding

    //add a little padding to each end of time/x axis
    var xExtent = d3.extent(data, function(d) { return d[xAxisField]; })
    var xDomainExtent0 = d3.timeDay.offset(xExtent[0], -7)
    var xDomainExtent1 = d3.timeDay.offset(xExtent[1], 7)
    x.domain([xDomainExtent0, xDomainExtent1]);
    //x.domain([xExtent[0].addDays(-7), xExtent[1].addDays(7)]);
    //x.domain(d3.extent(data, function(d) { return d[xAxisField]; }));
    //x.domain(data.map(function(d) { return d[xAxisField]; }));
    y0.domain([minWeight, maxWeight]);
    y1.domain([minReps, maxReps]);
    y2.domain([minTotal, maxTotal]);


    // Add the paths.
    var weight = svg.append("path")
        .data([data])
        .attr("class", "line-weight")
        .attr("d", weightline);

    var reps = svg.append("path")
        .data([data])
        .attr("class", "line-reps")
        .attr("d", repsLine);

    var totalWeight = svg.append("path")
        .data([data])
        .attr("class", "line-total-weight")
        .attr("d", totalWeightLine);


    // Add the dots
    function drawDot(yField, yAxisFn,dotClass) {
      var dotSize = 2
      counter = startCounter
      svg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("r", dotSize)
          .attr("cx", function(d) {
            if (d.date.getTime() !== lastDate.getTime()) {
              counter = startCounter
              lastDate = d.date
              return x(d[xAxisField]);
            } else {
              lastDate = d.date
              var result = x(d[xAxisField]) + counter
              counter += countIncrement
              return result
            }
          })
          .attr("cy", function(d) { return yAxisFn(d[yField]); })
          .attr("class", dotClass);
    }

    drawDot("weight",y0,"y0dot")
    drawDot("reps",y1,"y1dot")
    drawDot("totalWeight",y2,"y2dot")

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));


    // Add the Y0 Axis
    svg.append("g")
        .attr("class", "axisSteelBlue")
        //.attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisLeft(y0).ticks(6))
        .append("text")
          .attr("class", "y0title")
          .attr("transform", "rotate(-90)")
          .attr("x",-height/2)
          .attr("y", 6)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("Weight");


    // Add the Y1 Axis
    svg.append("g")
        .attr("class", "axisRed")
        .call(d3.axisLeft(y1).ticks(6))
        .append("text")
          .attr("class", "y1title")
          .attr("transform", "rotate(-90)")
          .attr("x",-height/3*2.5)
          .attr("y", 6)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("Reps");

    // Add the Y2 Axis
    svg.append("g")
        .attr("class", "axisGreen")
        .call(d3.axisLeft(y2).ticks(6))
        .append("text")
          .attr("class", "y1title")
          .attr("transform", "rotate(-90)")
          .attr("x",-height/3*.5)
          .attr("y", 6)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("Total")

    // add the X gridlines
    svg.append("g")
        .attr("class", "xGrid")
        .attr("transform", "translate(0," + height + ")")
        .call(makeXgridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    // add the Y0 gridlines
    svg.append("g")
         .attr("class", "y0grid")
         .call(makeY0gridlines()
             .tickSize(-width)
             .tickFormat("")
         )
     // add the Y1 gridlines
    svg.append("g")
          .attr("class", "y1grid")
          .call(makeY1gridlines()
              .tickSize(-width)
              .tickFormat("")
          )
      // add the Y2 gridlines
    svg.append("g")
           .attr("class", "y2grid")
           .call(makeY2gridlines()
               .tickSize(-width)
               .tickFormat("")
           )


    //dynamic mouseover stuff, from https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3
    var bisectX = d3.bisector(function(d) { return d[xAxisField]; }).left;

    var focus = fg.append("g")
           .attr("class", "focus")
           .style("display", "none");

    focus.append("line")
       .attr("class", "x-hover-line hover-line")
       .attr("y1", -margin.top)
       .attr("y2", height-margin.top);

    focus.append("line")
       .attr("class", "y-hover-line hover-line")
       .attr("x1", width)
       .attr("x2", width);

    //  focus.append("circle")
    //     .attr("r", 7.5);

    focus.append("text")
      .attr("x", 15)
     	.attr("dy", ".31em");

    svg.append("rect")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
     .attr("class", "overlay")
     .attr("width", width)
     .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

  function mousemove() {
  //     var x0 = x.invert(d3.mouse(this)[0])
  //     var i = bisectX(data, x0, 1)
  //     var d0 = data[i - 1]
  //     var d1 = data[i]
  //     var d = x0 - d0[xAxisField] > d1[xAxisField] - x0 ? d1 : d0
  //     focus.attr("transform", "translate(" + x(d[xAxisField]) + "," + y0(d.weight) + ")");
  //     focus.attr("transform", "translate(" + x(d[xAxisField]) + ",0)");
  //     focus.select("text").text(function() {
  //        return d.weight + "kgs / " + d.reps + " reps";
  //       });
  //     // focus.select(".x-hover-line").attr("y2", height - y0(d.weight));
  //     // focus.select(".y-hover-line").attr("x2", width + width);
  }


}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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

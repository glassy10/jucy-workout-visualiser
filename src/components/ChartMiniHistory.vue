<template>
  <div>
    <div :id="'chart-mini-history' + exerciseId"></div>
  </div>
</template>

<script>
// var sql = require('../../static/sql.js')
// https://github.com/kripken/sql.js
var d3 = require('d3')
var d3Time = require('d3-time')
var d3Color = require('d3-color')

export default {
  name: 'chart-mini-history',
  components:{
  },
  props:{
    exerciseId: Number,
    data: Array,
    workoutDate:Number,
    startDate: {
      default: 1483535523224,
      type: Number
    }
  },
  data () {
    return {
      debug: false
    }
  },
  methods: {
    processData: function(){
      var vm = this
      var tmpData = vm.data

      //remap data so we get array of arrays
      const series = [...new Set(tmpData.map(item => item.unit))].sort();
      vm.debug && console.log('series',series)
      vm.debug && console.log('tmpData',JSON.stringify(tmpData))
      var measurements = series.map(item => {
        return {
          id: item,
          values: tmpData.filter(val => {
              return val.unit === item
            }).map(d => {
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
          measurements[0].values.forEach((ite,ind) => {
            var obj = {}
            obj.date = ite.date
            obj.measurement = ite.measurement * measurements[1].values[ind].measurement
            totalWeights.values.push(obj)
          })
        //})
        measurements.push(totalWeights)
      }

      drawChart(measurements,vm.debug, vm.exerciseId,vm.workoutDate)
    }
  },
  mounted: function () {
    this.processData()
    this.debug && console.log('created - this.exerciseId: ',this.exerciseId)
    this.debug && console.log('data',this.data)
  }
}

  function drawChart(measurements,debug,exerciseId,workoutDate) {
    debug && console.log('chart para - measurements',JSON.stringify(measurements))
    debug && console.log('chart para - debug',debug)
    debug && console.log('chart para - exerciseId',exerciseId)

    var dateFormat = d3.timeFormat("%a, %e %b '%y")

    var margin = {top: 0, right: 85, bottom: 18, left: 12},
      width = 360 - margin.left - margin.right,
      height = 180 - margin.top - margin.bottom;

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    debug && console.log('chart svg selector',"#chart-mini-history" + exerciseId)
    var svg = d3.select("#chart-mini-history" + exerciseId).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set the x & z ranges
    var x = d3.scaleTime().range([0, width]);
    x.domain(d3.extent(measurements[0].values, d => d.date));
    var z = d3.scaleOrdinal(d3.schemeCategory10);
    z.domain(measurements.map(d => d.id));

    // define the line
    function line (yScale) {
      return d3.line()
        .x(d => x(d.date))
        .y(d => yScale(d.measurement));
    }

    // var dotDiv = d3.select("body").append("div")
    //     .attr("class", "dot-tip")
    //     .style("opacity", 0);


    var countSeries = measurements.length

    measurements.forEach(function(item,index){
      var chartGap = 0
      var chartTop = height * (index+1)/countSeries
      var chartBottom = (height * index/countSeries) + chartGap

      var y = d3.scaleLinear().range([chartTop, chartBottom])
      var minValue = d3.min(item.values, d => +d.measurement)
      var maxValue = d3.max(item.values, d => +d.measurement)
      y.domain([minValue-(minValue*.25), maxValue+(maxValue*.25)]);

      var mLine = g.append("path")
          .data([item.values])
          .attr("class", "lineSm")
          .style("stroke", d => z(index))
          .attr("fill", "none")
          .style("opacity",".5")
          .attr("d", line(y));

      var radiusIncrement = 2
      var counter = radiusIncrement
      var lastDate = new Date(item.values[0].date)
      var dot = g.selectAll("g.dot")
        .data(item.values)
          .enter().append("circle")
            .attr("class", "y2dot")
            .style("stroke", function(d) {
              if (d.date !== workoutDate) {
               return z(index);
             } else {
                return "rgb(31, 119, 180)"
              }
            })
            .style("fill", "none")
            .style("stroke-width", "1px" )
            .attr("r",
              function(d){
               var dat = new Date(d.date)
               if (dat.getTime() !== lastDate.getTime() ) {
                 lastDate = new Date(d.date)
                 counter = radiusIncrement
                 return radiusIncrement;
               } else {
                 lastDate = new Date(d.date)
                 counter += radiusIncrement
                 return counter
               }
             })
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.measurement))

      //add labels to lines
      g.append("text")
        .attr("transform", function(d) {
           return "translate(" + x(item.values[item.values.length-1].date) + "," + (chartBottom + 30) + ")";
           //return "translate(" + x(item.values[item.values.length-1].date) + "," + x(item.values[item.values.length-1].measurement) + ")";
          })
        .attr("x", 10)
        .attr("dy", "0.35em")
        .attr("class","measureLblSm")
        //.style("stroke", function(d){return z(index)})
        .style("fill", d => z(index))
        .text(d => item.id);
    })

    // Add the X Axis
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .ticks(2,"%b"));

      // //=-====add some mouseover interactivity=====

      //summarise the data to one entry per date
      var tmpSummaryData = []
      measurements.forEach((item,index) => {
        var type = item.id
        item.values.forEach(ite => {
          var obj = {}
          obj.type = type;
          obj.date = ite.date
          obj.measurement = ite.measurement
          tmpSummaryData.push(obj)
        })
      })
      var summaryData = d3.nest()
      .key(d => d.date)
      .entries(tmpSummaryData);
      debug && console.log('summaryData',JSON.stringify(summaryData))
      var summaryDataCount = summaryData.length
      var halfXdataDistance = width/summaryDataCount/2

      //the popup div
      var summaryDiv = d3.select("body")
        .append("div")
        .attr("class", "summarytip");
      //add some invisible rects over the dots to act as mouseover surfaces
      var invisRect = g.selectAll("g.rect")
        .data(summaryData)
        .enter().append("rect")
          //.attr("class", "bar")
          .attr("x",d =>  x(d.key) - halfXdataDistance )
          .attr("y",d => margin.top )
          .attr("width",(width/summaryDataCount)-3)
          .attr("height",height)
            .style("fill","red")
          .attr("opacity","0")

      invisRect.on("mouseover", function(d){
        var html = ''
        d.values.forEach(item => {
          html += item.measurement + " " + item.type
          html += "<br/>"
        })
        summaryDiv.style("left", d3.event.pageX+10+"px");
        summaryDiv.style("top", d3.event.pageY-25+"px");
        summaryDiv.style("display", "inline-block");
        summaryDiv.html("<div class='summarytip-head'>" +
          dateFormat(new Date(+d.key)) +
        "</div>" +
        "<div class='summarytip-body'>" +
          html +
        "</div>");
        d3.select(this).classed("summaryMouseover", true);
      });

      invisRect.on("mouseout", function(d){
        summaryDiv.style("display", "none");
        d3.select(this).classed("summaryMouseover", false);
      });

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.summaryMouseover {
  cursor: pointer;
}
.summarytip {
  background: #eee;
  box-shadow: 0 0 5px #999999;
  color: #333;
  /*display: inline-block;*/
  font-size: 12px;
  text-align: left;
  /*width: 170px;*/
  z-index: 10;
  pointer-events: none;
  position: absolute;
  display: none;
  width: auto;
  height: auto;
  opacity:.9
  /*height:150px;*/
}
.summarytip-head {
  color:white;
  background-color:rgb(31, 119, 180);
  font-weight:bold;
  font-size:14px;
  padding: 3px 6px 2px 6px;
}

.summarytip-body {
  padding: 3px 6px 2px 6px;
}
.yAxisTicks {
  font-family: Roboto,sans-serif;
  font-size: 12px;
  shape-rendering: crispEdges;
}
.measureLblSm {
  font-family: Roboto,sans-serif;
  font-size: 12px;
  shape-rendering: crispEdges;
}

.lineSm, .lineSm line, .lineSm path {
  fill: none;
  stroke-width: 2px;
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

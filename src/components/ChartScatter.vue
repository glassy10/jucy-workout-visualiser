<template>
  <div>
    <div id="chart-reps-weight"></div>
  </div>
</template>

<script>
var d3 = require('d3')
var d3Color = require('d3-color')

export default {
  name: 'chartScatter',
  props:{
    data:Array
  },
  data () {
    return {
      debug: true
    }
  },
  methods: {
    processData: function(){
      var vm = this
      //[{"id":"Reps","values":[{"date":1483982745198,"measurement":"8"},{"date":1483982745198,"measurement":"7"},{...}},
      // {"id":"Weight","values":[{"date":1483982745198,"measurement":"44"},{"date":1483982745198,"measurement":"44"},{...}},
      //etc also totalWeight, L/H Reps, R/H Reps...
      var reps = vm.data.filter(function(item){
        return item.id === "Reps"
      }).map(function(item){
        return item.values
      })[0]
      var weight = vm.data.filter(function(item){
        return item.id === "Weight"
      }).map(function(item){
        return item.values
      })[0]
      var scatterData = []
      reps.forEach(function(item,index){
        var obj = {
          date: item.date,
          reps: item.measurement,
          weight : weight[index].measurement
        }
        scatterData.push(obj)
      })

      //console.log('scatterData',JSON.stringify(scatterData))

      drawChart(scatterData,vm.debug)
    }
  },
  watch:{
    data: function(newValue){
      this.debug && console.log('chartScatter watch triggered')
      this.processData()
    }
  },
  created: function () {
    this.processData()
    this.debug && console.log('chartScatter created')
  }
}

  function drawChart(data,debug) {
    console.log('drawChart gets data',JSON.stringify(data))

    var margin = {top: 5, right: 5, bottom: 50, left: 50},
      width = 200 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#chart-reps-weight").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set the x, y & z ranges
     var x = d3.scaleLinear().range([width, 0])
     x.domain(d3.extent(data,function(d){return +d.reps}))
     var y = d3.scaleLinear().range([height, 0])
     y.domain(d3.extent(data,function(d){return +d.weight}));
    // var z = d3.scaleOrdinal(d3.schemeCategory10);
    // z.domain(data.map(function(d) { return d.id; }));
    //
    //gridlines
    // gridlines in x axis function
    function makeXgridlines() {
        return d3.axisBottom(x)
            .ticks(4)
    }
    // add the X gridlines
    g.append("g")
        .attr("class", "xGrid")
        .attr("transform", "translate(0," + height + ")")
        .call(makeXgridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    // gridlines in y axis function
    function makeYgridlines(yScale) {
      return d3.axisLeft(yScale).ticks(4)
    }
    // add the Y gridlines
    g.append("g")
         .attr("class", "yGrid")
         //.attr("stroke", function(d){return z(index)})
         .call(makeYgridlines(y)
             .tickSize(-width)
             .tickFormat("")
         )


    // Add the y Axis
     g.append("g")
         .attr("class", "yAxisTicks")
         .attr("stroke", "ccc")
         //.attr("transform", "translate( " + width + ", 0 )")
         .call(d3.axisLeft(y).ticks(5))

   // text label for the y axis
     g.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 0 - margin.left)
         .attr("x",0 - (height / 2))
         .attr("dy", "1em")
         .attr("class","axisHeading")
         .style("text-anchor", "middle")
         .text("Weight");


    // Add the X Axis
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5))

    // text label for the x axis
    g.append("text")
      .attr("transform", "translate(" + (width/2) + " ," +
                              (height + margin.top + 24) + ")")
        .attr("class","axisHeading")
         .style("text-anchor", "middle")
         .text("Reps");

         var radius = 2
         g.selectAll("g.dot")
          .data(data)
            .enter().append("circle")
              .attr("class", "y2dot")
              .style("stroke", "rgb(31, 119, 180)" )
              .style("fill", "rgb(31, 119, 180)" )
              .style("stroke-width", "0px" )
              .attr("r",radius)
              .attr("cx", function(d,i) {
                //introduce small randomness
                var random = Math.floor(Math.random() * (3 - -3 + 1)) + -3;
                 return x(d.reps) + random;
                })
              .attr("cy", function(d,i) {
                //introduce small randomness
                var random = Math.floor(Math.random() * (3 - -3 + 1)) + -3;
                 return y(d.weight) + random;
                })

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.yAxisTicks {
  font-family: Roboto,sans-serif;
  font-size: 12px;
  shape-rendering: crispEdges;
}
.axisHeading {
  font-family: Roboto,sans-serif;
  font-size: 12px;
  shape-rendering: crispEdges;
}
.xGrid {
  font-family: Roboto,sans-serif;
  font-size: 12px;
  shape-rendering: crispEdges;
}
path.domain, .tick line  {
  stroke:#ccc;
  stroke-width:1px;
}

</style>

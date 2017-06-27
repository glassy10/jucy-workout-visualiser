<template>
  <div class="row">
    <div class="col-3">
      <h6 style="line-height:150%;">Category Breakdown</h6><!-- style="position: relative;top: 50%;transform: perspective(1px) translateY(-50%);line-height:150%;" -->
        <label><input type="radio" name="dataset" value="weight"> By weight</label>
        <br/>
        <label><input type="radio" name="dataset" value="sets" checked> By sets</label>
        <br/>
        <label><input type="radio" name="dataset" value="reps"> By reps</label>

    </div>
    <div class="col-9" style="text-align:center;">
      <div id="chart-category-pie"></div>
    </div>
  </div>
</template>

<script>
// var sql = require('../../static/sql.js')
// https://github.com/kripken/sql.js
var d3 = require('d3')
var d3Time = require('d3-time')
var d3Color = require('d3-color')
import Utilities from '@/components/utils/Utilities'

export default {
  name: 'chart-category-pie',
  components:{
  },
  props:{
    data: Array,
  },
  data () {
    return {
      debug: false
    }
  },
  watch: {
    data:function(newValue){
      drawChart(newValue,this.debug)
    }
  },
  mounted: function () {
    drawChart(this.data,this.debug)
  }
}

  function drawChart(data,debug) {
    debug && console.log('chart data: ',JSON.stringify(data))

    // d3.select("#chart-category-pie").remove();
    d3.select("#chart-category-pie svg").remove();

    var width = 200;
    var height = 200;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 40;
    var legendRectSize = 12;
    var legendSpacing = 3;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select('#chart-category-pie')
      .append('svg')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    // var tooltip = d3.select('#chart-category-pie')
    //   .append('div')
    //   .attr('class', 'tooltip')
    //   .html("I'm the tooltip");


    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var arc = d3.arc()
      .innerRadius(radius - donutWidth)
      .outerRadius(radius)
      .padAngle(0.02)
      .cornerRadius(3);

    var pie = d3.pie()
      .value(function(d) { return d.sets; })
      .sort(null);

    var path = svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d) {
        return color(d.data.category);
      });

    path.on('mouseover', function(d) {
      var weightTotal = d3.sum(data.map((d) => { return d.weight; }))
      var setsTotal = d3.sum(data.map((d) => { return d.sets; }))
      var repsTotal = d3.sum(data.map((d) => { return d.reps; }))
      var weightPercent = Math.round(1000 * d.data.weight / weightTotal) / 10
      var setsPercent = Math.round(1000 * d.data.sets / setsTotal) / 10
      var repsPercent = Math.round(1000 * d.data.reps / repsTotal) / 10
      div.transition()
          .duration(40)
          .style("opacity", .9)
      div.html(// "Category: <b>" + d.data.category + "</b><br/>" +
              "<div class='tooltip-head' style='background-color:" +
                color(d.data.category) + "'>" + d.data.exercise +
              "</div>" +
              "<div class='tooltip-body'>" +
                "Weight: <b>" + d.data.weight  + "kgs (" + weightPercent + "%)</b><br/>" +
                "Sets: <b>" + d.data.sets  + " (" + setsPercent + "%)</b><br/>" +
                "Reps: <b>" + d.data.reps  + " (" + repsPercent + "%)</b>" +
              "</div>")
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY - 88) + "px")
      d3.select(this).classed("barMouseOver", true);
    })

    path.on('mouseout', function() {
      div.transition()
         .duration(50)
         .style("opacity", 0)
      d3.select(this).classed("barMouseOver", false)
    });

    var legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legendCategoryPie')
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset =  height * color.domain().length / 2;
        var horz = -2 * legendRectSize;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend.append('rect')
      .attr("class","rectCategoryPie")
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', color)
      .style('stroke', color);

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { return d; });

    var timeout = setTimeout(function() {
      d3.select("input[value=\"weight\"]").property("checked", true).each(change);
    }, 1);

    d3.selectAll("input")
          .on("change", change);

    function change() {
        var value = this.value;
        clearTimeout(timeout);
        pie.value(function(d) { return d[value]; }); // change the value function
        path = path.data(pie(data)); // compute the new angles
        path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
      }
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.legendCategoryPie {
  font-family: Roboto,sans-serif;
  font-size: 10px;
}
.rectCategoryPie rect{
  stroke-width: 2;
}
#chart-category-pie {
  height: 200px;
  position: relative;
  width: 200px;
}
.barMouseOver {
  cursor: pointer;
  stroke: #66cc66;
  stroke-width: 2;
}
.tooltip {
  background: #eee;
  box-shadow: 0 0 5px #999999;
  color: #333;
  display: block;
  font-size: 12px;
  text-align: left;
  width: 170px;
  z-index: 10;
  pointer-events: none;
  /*height:150px;*/
}

.tooltip-head {
  color:white;
  /*background-color:rgb(31, 119, 180);*/
  font-weight:bold;
  font-size:14px;
  padding: 3px 6px 2px 6px;
}

.tooltip-body {
  padding: 3px 6px 2px 6px;
}
</style>

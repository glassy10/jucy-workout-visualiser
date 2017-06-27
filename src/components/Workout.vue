<template>
  <div id="workout">
    <div v-if="!analysingWorkout">
      <h3>{{workout.workoutName}} <!-- <small style="font-weight:200;">(id: {{workout.workoutId}})</small>--></h3>
      <br/>
      <div class="row">
        <div class="col-md-6">


          <div class="row">

            <div class="col-1">
              <i class="fa fa-calendar fa-2x"></i>
            </div>
            <div class="col-5" >
              <div class="stat-head">Date</div>
              <div class="stat-body">{{workout.fDate}}</div>
              <div class="stat-body-sm">{{workout.startTime}}</div>
            </div>

            <div class="col-1">
              <i class="fa fa-clock-o fa-2x"></i>
            </div>
            <div class="col-5">
              <div class="stat-head">Length</div>
              <div class="stat-body">{{workout.workoutLength}} mins</div>
            </div>
          </div>

          <div class="row" style="margin-top:20px;">

            <div class="col-1">
              <i class="fa fa-hand-grab-o fa-2x"></i>
            </div>
            <div class="col-5">
              <div class="stat-head">Weight</div>
              <div class="stat-body">{{workout.totalSessionWeight}} kgs</div>
            </div>

            <div class="col-1">
              <i class="fa fa-trophy fa-2x"></i>
            </div>
            <div class="col-5">
              <div class="stat-head">some stat</div>
              <div class="stat-body">stat here</div>
            </div>

          </div>

          <br/>
          <div v-if="workout.notes">
            <h6>Notes</h6>
            {{workout.notes}}
          </div>
          <!-- <div v-else style="margin-top:10px;"><em>No notes</em></div> -->

        </div>

        <div class="col-md-6">
          <chart-category-pie :data="categoryPieData"></chart-category-pie>
        </div>
      </div>
      <hr/>
      <!-- <h4 style="margin-bottom:24px">Exercises</h4> -->
      <div v-for="(w, index) in workout.exercises">
        <div class="row">
          <div class="col-md-6">
            <h5>
              <em>{{index+1}}</em> &nbsp;
              <a href="" @click.prevent="viewExercise(w.key.split('|')[1])">
                {{w.key.split('|')[0]}}
              </a>
              <!-- <small>(id: {{w.key.split('|')[1]}})</small> -->
            </h5>
            <table  class="table table-sm">
              <tbody>
                <tr v-for="(measure,index) in w.values" v-if="index === 0">
                  <td><small><em>Set</em></small></td>
                  <td v-for="(val,index) in measure.values"  style="padding-right:3px;text-align:right;">
                    <small><em>{{index+1}}</em></small>
                  </td>
                </tr>
                <tr v-for="measure in w.values.sort(function(a,b){return a.unit - b.unit})">
                  <td style="padding-right:24px;">
                    {{measure.values[0].unit}} {{measure.values[0].desc.replace("kilograms","(kgs)").replace("times","")}}
                  </td>
                  <td v-for="(val,index) in measure.values" style="padding-right:3px;text-align:right;">
                    {{val.setNum}}
                  </td>
                </tr>
              </tbody>
              <!-- <tfoot>
                <tr>
                  <td>
                    <small style="font-weight:200;">Total weight lifted: <b>{{w.totalWeight}}</b></small>
                    <br/>
                    <small style="font-weight:200;">Exercise group: <b>{{w.exerciseGroupName}}</b></small>
                    <br/>
                    <small style="font-weight:200;">Estimated One-rep max: <b>{{w.oneRepMax}}</b></small>
                  </td>
                </tr>
              </tfoot> -->
            </table>
            <small style="font-weight:200;">Total weight lifted: <b>{{w.totalWeight}}</b></small>
            <br/>
            <small style="font-weight:200;">Exercise group: <b>{{w.exerciseGroupName}}</b></small>
            <br/>
            <small style="font-weight:200;">Estimated One-rep max: <b>{{w.oneRepMax}}</b></small>
          </div>
          <div class="col-md-6" style="text-align:center;">
            <chart-mini-history
              :exerciseId="+w.key.split('|')[1]"
              :startDate="startDate/1"
              :workoutDate = "workoutDate"
              :data = "exerciseData(+w.key.split('|')[1])">
            </chart-mini-history>
          </div>
        </div>
        <hr/>
      </div>

      <a href="" @click.prevent="navigateTo(-1)">Previous workout</a> |
      <a href="" @click.prevent="navigateTo(1)">Next workout</a>

      <br/><br/>
    </div>
    <div v-if="analysingWorkout"  class="loading-updater" >
      <img src="../assets/loading-animations-preloader-gifs-ui-ux-effects-28.gif"/>
      <span v-html="processingStage"></span>
    </div>
  </div>
</template>

<script>
var d3 = require('d3')
var d3Time = require('d3-time')
import Store from '@/components/Store'
import Utilities from '@/components/utils/Utilities'
import ChartMiniHistory from '@/components/ChartMiniHistory'
import ChartCategoryPie from '@/components/ChartCategoryPie'
import router from '../router/'

export default {
  name: 'workout',
  components: {
    router, ChartMiniHistory, ChartCategoryPie
  },
  data () {
    return {
      state: Store.state,
      workoutId: +this.$route.params.id,
      workout:[],
      startDate:1486535523000/1,
      workoutDate:1,
      chartData:[],
      debug: false,
      categoryPieData:[],
      analysingWorkout:true,
      processingStage:"Loading workout..<br/>"
    }
  },
  methods: {
    exerciseData: function(exerciseId){
      return this.chartData.filter(function(el){return el.ex_id === exerciseId })
        // .sort(function(a,b) {
        //   //return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0)
    },
    getWorkout:function(workoutId){
      var vm = this;
      Utilities.loadBinaryFile(vm.state.jucyFileURL, function (data) {
        //eslint-disable-next-line
        var db = new SQL.Database(data)
        var sqlStr = 'select w.id as workout_id, w.date, w.end_date, w.notes, w.name as wkName, e.name as exName, e.ex_group, eg.name as group_name, '
        sqlStr += 'er.exercise_id, er.id as resultsId, sets.value as setNum, unit_types.desc, mu.unit, mu.id as mu_id '
        sqlStr += 'from workouts as w '
        sqlStr += 'inner join exercise_results as er on w.id = er.workout_id '
        sqlStr += 'inner join exercise_sets as sets on er.id = sets.result_id '
        sqlStr += 'inner join measure_units as mu on sets.measure_id = mu.id '
        sqlStr += 'inner join unit_types on mu.unit_id = unit_types.id '
        sqlStr += 'inner join exercises as e on er.exercise_id = e.id '
        sqlStr += 'inner join exercise_groups as eg on e.ex_group = eg.id '
        sqlStr += 'where w.id = ' + workoutId
        var sqlWorkout = db.exec(sqlStr)//db.exec('SELECT * FROM "workouts" JOIN "workout_exercise_join" ON "workouts".id = "workout_exercise_join".workout_id LIMIT 1000,30')
        var workout = Utilities.sqlJsonify(sqlWorkout);
        // console.log('workout sql',workout)

        var formatDate = d3.timeFormat("%d/%m/%Y");
        var formatTime = d3.timeFormat("%X");
        vm.workout = {}
        vm.workout.workoutName = workout[0].wkName
        vm.workout.workoutId = workout[0].workout_id
        vm.workout.date = workout[0].date
        vm.workout.end_date = workout[0].end_date
        vm.workout.startTime = formatTime(new Date(workout[0].date))
        vm.workout.endTime = formatTime(new Date(workout[0].end_date))
        vm.workout.workoutLength = ((+vm.workout.end_date/1000 - +vm.workout.date/1000)/60).toFixed(0)
        vm.workout.fDate = formatDate(new Date(workout[0].date))
        vm.workout.notes = workout[0].notes

        var exercises = d3.nest()
          .key(function(d) { return d.exName + "|" + d.exercise_id; })
          .key(function(d) {
            delete d.notes
            delete d.date
            delete d.end_date
            delete d.exName
            delete d.exercise_id
            delete d.wkName
            return d.mu_id
          }).sortKeys(d3.ascending)
          //.rollup(function(leaves) { return leaves.length; })
          .entries(workout);
        vm.debug && console.log('exercises',exercises)
        //calculate total weights lifted + one rep max
        //see stack overflow https://stackoverflow.com/questions/43319102/obtaining-totals-from-properties-of-parallel-arrays-in-nested-objects
        var totalSessionWeight = 0
        exercises.forEach(function (o) {
          vm.processingStage += "<br/>Analysing " + o.key.split("|")[0] + "..."
          console.log('vm.processingStage',vm.processingStage)
          o.exerciseGroupId = o.values[0].values[0].ex_group
          o.exerciseGroupName = o.values[0].values[0].group_name
          o.totalWeight = o.values.map(function (a) {
            return a.values.map(function (b) {
              return +b.setNum;
            });
          }).reduceRight(function (a, b, j) {
              return a.map(function (v, i) {
                totalSessionWeight += j ? v + b[i] : v * b[i]
                return j ? v + b[i] : v * b[i];
            });
          }).reduce(function (a, b) {
              return a + b;
            });
          let firstSetReps = o.values.filter(item => item.key === "1")[0] ? o.values.filter(item => item.key === "1")[0].values[0].setNum : 0
          let firstSetWeight = o.values.filter(item => item.key === "3")[0] ? o.values.filter(item => item.key === "3")[0].values[0].setNum : 0
          var oneRepMax
          if (firstSetReps === 1) {
            oneRepMax = firstSetWeight
          } else if (firstSetReps <= 10) {
            oneRepMax = Math.round(firstSetWeight/(1.0278-0.0278*firstSetReps))
          } else {
            oneRepMax = "n/a (more than 10 reps)"
          }
          o.oneRepMax = oneRepMax
        });
        vm.workout.exercises = exercises
        vm.workout.totalSessionWeight = totalSessionWeight
        vm.debug && console.log('vm.workout.exercises',vm.workout.exercises)
        //==================
        //FORMAT DATA FOR CATEGORY PIE CHART
        vm.categoryPieData = vm.workout.exercises.map(function(item){
          return {
            sets:item.values[0].values.length,
             reps:item.values.filter(function(a){
                 return a.key === "1" || a.key === "7" || a.key === "8"//key 1 is the "times" type - ie number of reps"
               }).map(function(b){
                 return b.values
               })[0].reduce(function(acc,obj){
                  return acc + +obj.setNum
               },0),
            weight:item.totalWeight,
            category:item.exerciseGroupName,
            exercise:item.key.split("|")[0]
          }
        }).sort(function(a,b){return (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0)})
        //console.log('vm.categoryPieData',JSON.stringify(vm.categoryPieData))
        //==================
        //GET DATA FOR MINI CHARTS
        //vm.debug && console.log('getExerciseData is getting data')
        var exercisesSqlOrClause = ""
        var exerciseIdList = vm.workout.exercises.map(function(item){
          return +item.key.split('|')[1]
        })
        //console.log('exerciseIdList',exerciseIdList)
        for (var i = 0;i < exerciseIdList.length;i++) {
          exercisesSqlOrClause += "or e.id = " + exerciseIdList[i] + " "
        }
        //console.log('exercisesSqlOrClause',exercisesSqlOrClause.substring(3))

        //determine dates to get according to date of requested workout
        //look up date of requested workout in Store
        var workoutDate = vm.state.workouts.find(function(workouts) {return workouts.id === vm.workoutId }).date
        vm.workoutDate = workoutDate;
        vm.debug && console.log('workoutDate',workoutDate) //date in unix milliseconds
        var todayDate = (new Date).getTime();
        vm.debug && console.log('todayDate',todayDate) //date in unix milliseconds
        var timeBetweenTodayAndWorkoutDate = todayDate - workoutDate
        const threeMonths = 91*24*60*60*1000;
        const oneAndaHalfMonths = threeMonths/2;
        var startDate,endDate
        if (timeBetweenTodayAndWorkoutDate > oneAndaHalfMonths) {
          startDate = workoutDate - oneAndaHalfMonths;
          endDate = workoutDate + oneAndaHalfMonths;
        } else {
          startDate = todayDate - threeMonths
          endDate = todayDate
        }
        vm.debug && console.log('startDate',startDate)
        vm.debug && console.log('endDate',endDate)
        var sqlExStr = 'select es.value, mu.unit, ut.desc, w.date as date, e.id as ex_id, e.name, er.workout_id, er.id as results_id '
        sqlExStr +=	'from exercise_sets as es inner join measure_units as mu on es.measure_id = mu.id '
        sqlExStr +=	'inner join unit_types as ut on mu.unit_id = ut.id '
        sqlExStr +=	'inner join exercise_results as er on es.result_id = er.id '
        sqlExStr +=	'inner join workouts as w on er.workout_id = w.id '
        sqlExStr +=	'inner join exercises as e on er.exercise_id = e.id '
        sqlExStr +=	'where (' + exercisesSqlOrClause.substring(3) + ') '
        sqlExStr +=	'and date >= ' + startDate + ' and date <= ' + endDate + ' '
        sqlExStr +=	'order by date'
        vm.debug && console.log('exerciseData - sql string is',sqlExStr)
        var sqlExercises = db.exec(sqlExStr)

        vm.chartData = Utilities.sqlJsonify(sqlExercises);
        vm.debug && console.log('vm.chartData', JSON.stringify(vm.chartData))
        vm.analysingWorkout = false
      })

    },

    viewExercise:function(exerciseId){
      router.push({ path: '/exercise/' + exerciseId })
    },
    navigateTo:function(num) {
      var workoutIdToNavigateTo = +this.workoutId + num/1
      router.push({ path: '/workout/' + workoutIdToNavigateTo })
      this.workoutId = workoutIdToNavigateTo
      this.getWorkout(workoutIdToNavigateTo)
    }
  },

  created: function() {
    var vm = this
    vm.debug && console.log('vm.state.jucyFileURL.length', vm.state.jucyFileURL.length < 1)
    if (vm.state.jucyFileURL.length < 1) {
      vm.debug && console.log('workout router push to loadjucyfile')
      router.push({ path: '/loadjucyfile' })
    } else {
      this.getWorkout(this.workoutId)
    }
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fa {
  color: rgb(44, 160, 44);
}
.stat-head {
  font-size:12px;
  font-weight:200;
}
.stat-body {
  font-size: 18px;
  font-weight:400;
}
.stat-body-sm {
  font-size: 12px;
}
.loading-updater {
  left: 50%;
  top: 50%;
  position: fixed;
  -webkit-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
  text-align:center;
  font-size:16px;
  color: green;
}
</style>

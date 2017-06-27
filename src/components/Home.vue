<template>
  <div id="home">
    <!-- <div v-if="!readingFile"> -->

      <!--DESKTOP -->
      <!--======= -->
      <div class="hidden-sm-down">
        <div class="row">
          <div class="col-lg-9 col-xl-8">
            <chart-calendar-view :data="state.workouts"></chart-calendar-view>
          </div>
          <div class="col-lg-3 col-xl-4">
            <workout-list :workouts = "state.workouts"></workout-list>
          </div>
        </div>
      </div>


      <!--MOBILE -->
      <!--====== -->
      <div class="hidden-md-up">
        <test-component :data="state.workouts"></test-component>
        <workout-list :workouts = "state.workouts"></workout-list>
      </div>


      <h5 style="margin-top:8px;">Exercises</h5>
      <div class="row">
        <div class="col-md-4">
          <div v-if="state.exercises.length>0">
            <select v-model="selectedExercise" @change="exerciseSelected()" class="form-control">
              <option value="-1">Please select</option>
              <option v-for="e in filteredExercises.slice().sort(function(a,b){return a.name < b.name ? -1: a.name > b.name ? 1:0})" :value="e.id" >
                {{e.name}}
              </option>
            </select>
          </div>
          <div v-else>
            No exercises set up
          </div>
        </div>
        <div class="col-md-4">
          <div v-if="state.categories.length>0">
            <select v-model="filter.selectedCategory" class="form-control">
              <option value="-1">Filter exercises by category</option>
              <option v-for="c in state.categories.slice().sort(function(a,b){return a.name < b.name ? -1: a.name > b.name ? 1:0})" :value="c.id" >
                {{c.name}}
              </option>
            </select>
          </div>
          <div v-else>
            No categories set up
          </div>
        </div>
        <div class="col-md-4">
          <div v-if="state.routines.length>0">
            <select v-model="filter.selectedRoutine" class="form-control" disabled="disabled">
              <option value="-1">Filter exercises by routine</option>
              <option v-for="r in state.routines.slice().sort(function(a,b){return a.name < b.name ? -1: a.name > b.name ? 1:0})" :value="r.id" >
                {{r.name}}
              </option>
            </select>
          </div>
          <div v-else>
            No routines set up
          </div>
        </div>
      </div>
      <br/>
      <small class="text-muted" style="font-weight:200;" >
        <b>Jucy file details:</b><br/> File name: {{state.jucyFile.name}} ({{state.jucyFile.size}} kb),<br/> last modified {{state.jucyFile.lastModifiedDate}}
      </small>
    <!-- </div> -->
    <div v-if="readingFile">
      Reading Workouts...
    </div>
  </div>
</template>

<script>

import Store from '@/components/Store'
import Utilities from '@/components/utils/Utilities'
import ChartCalendarView from '@/components/ChartCalendarViewComponent'
import TestComponent from '@/components/ChartMiniCalendarComponent'
import WorkoutList from '@/components/WorkoutListComponent'
import router from '../router/'
var d3 = require('d3')

//see https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications re File API
export default {
  name: 'home',
  components: {
    ChartCalendarView,
    router,
    TestComponent,
    WorkoutList
  },
  data () {
    return {
      debug: false,
      state: Store.state,
      filter: {
        selectedRoutine:"-1",
        selectedCategory:"-1",
      },
      selectedExercise:-1,
      readingFile:false
    }
  },
  computed: {
    limitWorkouts:function(){
      return this.state.workouts.slice().reverse().slice(0,6)
    },
    filteredExercises () {
      var vm = this;
      return vm.state.exercises
      .filter(function(item){
        if (vm.filter.selectedRoutine === "-1" && vm.filter.selectedCategory === "-1") {
          return item
        } else if (vm.filter.selectedCategory !== "-1") {
            return item.ex_group === vm.filter.selectedCategory
        } else if (vm.filter.selectedRoutine !== "-1") {
          vm.debug && console.log('TODO-will need to sql look up what routines the exercise is in routine_exercise_join')
            return item
        }
      })
    }
  },
  methods: {
    niceDate: function(unixDate){
      var dateFormat = d3.timeFormat("%a, %e %b '%y at %H:%M")
      return dateFormat(new Date(unixDate))
    },
    niceTime: function(unixDate){
      var dateFormat = d3.timeFormat("%H:%M")
      return dateFormat(new Date(unixDate))
    },
    exerciseSelected: function() {
      router.push({ path: '/exercise/' + this.selectedExercise })
    }
  },
  created: function(){
    var vm = this
    vm.readingFile = true
    vm.debug && console.log('vm.state.jucyFileURL.length', vm.state.jucyFileURL.length < 1)
    if (vm.state.jucyFileURL.length < 1) {
      vm.debug && console.log('home router push to loadjucyfile')
      router.push({ path: '/loadjucyfile' })
    } else {
      Utilities.loadBinaryFile(vm.state.jucyFileURL, function (data) {
        var exercisesSQL = 'select * from exercises'
        Store.setExercisesAction( Utilities.sqlJsonify(vm.state.db.exec(exercisesSQL)))
        vm.debug && console.log('exercises',vm.state.exercises)

        var routinesSQL = 'select * from routines'
        Store.setRoutinesAction( Utilities.sqlJsonify(vm.state.db.exec(routinesSQL)))

        var categoriesSQL = 'select * from exercise_groups'
        Store.setCategoriesAction( Utilities.sqlJsonify(vm.state.db.exec(categoriesSQL)))

        //TODO restrict this to last two years
        var lastYear = new Date().getFullYear() - 1
        var workoutsLimitDate = +new Date('01-01-' + lastYear)
        var workoutsSQL = 'select * from workouts where date >= ' + workoutsLimitDate
        var workouts = Utilities.sqlJsonify(vm.state.db.exec(workoutsSQL))
        var formatDate = d3.timeFormat("%Y-%m-%d");
        workouts.forEach(function(item,index){
          item.workoutLength = ((+item.end_date/1000 - +item.date/1000)/60).toFixed(0)
          item.fDate = formatDate(new Date(item.date))
        })
        Store.setWorkoutsAction(workouts);
        vm.debug && console.log('workouts',JSON.stringify(workouts))

        vm.readingFile = false
      })

    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.file-label {
  cursor: pointer;
  color:rgb(2, 117, 216);
}

select {
  margin-bottom:6px;
}
.workout-list-body {
  font-size:11px;
  color:#444;
}
hr {
  margin: 8px 0;
}
.fa {
  color: rgb(44, 160, 44);
}

</style>

<template>
  <div id="exercise" class="container">
    <div class="inline-item">
      Filter by Routine: <br/>
      <select v-model = "selectedRoutine" @change="getExercises()" class="form-control form-control-sm">
        <option v-for="routine in routines" :value="routine.id">{{routine.name}}</option>
      </select>
    </div>
    <div class="inline-item">
      Select Exercise: <br/>
      <select v-model = "selectedExercise" @change="getSets(selectedExercise)" class="form-control form-control-sm">
        <option v-for="ex in filteredExercises" :value="ex.id">{{ex.groupname}} - {{ ex.name}}</option>
      </select>
    </div>
    <div class="inline-item">
      Select Period: <br/>
      <a href="" @click.prevent="setStartDate(-7)">Wk</a>&nbsp;
      <a href="" @click.prevent="setStartDate(-31)">Mth</a>&nbsp;
      <a href="" @click.prevent="setStartDate(-91)">3m</a>&nbsp;
      <a href="" @click.prevent="setStartDate(-183)">6m</a>&nbsp;
      <a href="" @click.prevent="setStartDate(-365)">1y</a>&nbsp;
      <a href="" @click.prevent="setStartDate(-730)">2y</a>&nbsp;
      <a href="" @click.prevent="setStartDate(-9999)">All</a>&nbsp;
    </div>
    <!-- <div class="inline-item">
      <br/>
      <label class="form-check-label">
        <input class="form-check-input" type="checkbox" v-model="hideSets" >
        Hide individual sets
      </label>
    </div> -->

    <hr/>

    <chart-exercise-history :exerciseId="selectedExercise" :hideSets="hideSets" :startDate="startDate/1"></chart-exercise-history>

    <hr/>
    <!-- <exovis :exerciseId="selectedExercise" :hideSets="hideSets" :startDate="startDate/1"></exovis> -->
    <!-- <chart-exercise-sets :exerciseId="selectedExercise" :hideSets="hideSets" :startDate="startDate/1"></chart-exercise-sets> -->

  </div>
</template>

<script>
var d3Time = require('d3-time')

import Utilities from '@/components/utils/Utilities'
import ChartExerciseHistory from '@/components/ChartExerciseHistory'
import Store from '@/components/Store'
import router from '../router/'
export default {
  name: 'exercise',
  components: {
    router,ChartExerciseHistory,Utilities
  },
  data () {
    return {
      state: Store.state,
      exerciseId: +this.$route.params.id,
      routines: [],
      selectedRoutine: 0,
      exercises: [],
      filteredExercises: [],
      selectedExercise: 3,
      hideSets:false,
      startDate:1483535523224/1,
      debug:false
    }
  },
  methods: {
    getExercises: function() {
      var vm = this
      //need to filter vm.exercises here for only the routine requested
      //TODO routines not joined yet!!
      vm.filteredExercises = vm.exercises.filter(function(item){
        return item.routine_id === vm.selectedRoutine
      })
    },
    getSets: function(exerciseId) {
      this.selectedExercise = exerciseId
    },
    setStartDate: function(days) {
      var today = new Date();
      //needs to be unix format
      this.startDate = parseInt((d3Time.timeDay.offset(today,days)).getTime()).toFixed(0)/1
    }
  },
  created: function () {
    var vm = this
    if (this.$route.params.id) {
      vm.selectedExercise = +this.$route.params.id
    }

    Utilities.loadBinaryFile(vm.state.jucyFileURL, function (data) {
      //eslint-disable-next-line
      var db = new SQL.Database(data)
      //get routines
      var routinesSQL = 'select * from routines'
      vm.routines = Utilities.sqlJsonify(db.exec(routinesSQL))
      //get exercises (with groups, only exercises that have results)
      var exercisesSQL = 'select distinct ex.ex_group,ex.name,ex.id,gr.name as groupname,rej.routine_id ' //rej.routine_id as routineId
      exercisesSQL += 'from "exercises" as ex '
      exercisesSQL += 'inner join "exercise_groups" as gr on ex.ex_group = gr.id '
      exercisesSQL += 'inner join "exercise_results" as res on ex.id = res.exercise_id '
      exercisesSQL += 'inner join "routine_exercise_join" as rej on ex.id = rej.exercise_id '
      exercisesSQL += 'inner join "routines" as r on rej.routine_id = r.id '
      exercisesSQL += 'group by ex.id '
      exercisesSQL += 'order by groupname, ex.name'
      vm.exercises = Utilities.sqlJsonify(db.exec(exercisesSQL))
      vm.filteredExercises = vm.exercises
      vm.debug && console.log('vm.exercises',JSON.stringify(vm.exercises))
    })
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>

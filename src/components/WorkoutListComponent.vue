<template>
  <div id="workout-list">
    <h4 style="margin-bottom:14px;">Recent</h4>
    <div class="row" v-for="workout in limitWorkouts">
      <div class="col-2">
        <i class="fa fa-bar-chart fa-2x"></i>
      </div>
      <div class="col-10">
        <router-link :to="{ path: '/workout/' + workout.id }"  >
          <h6 class="workout-list-header">{{workout.name}}</h6>
          <div class="workout-list-body">
            {{niceDate(workout.date)}} ({{workout.workoutLength}} mins)
          </div>
        </router-link>
      </div>
      <hr style="width:100%;"/>
    </div>
  </div>
</template>
<script>

import router from '../router/'
var d3 = require('d3')

export default {
  name: 'workoutList',
  components: {
    router,
  },
  props: {
    workouts:Array
  },
  data () {
    return {
      debug: false,
    }
  },
  computed: {
    limitWorkouts:function(){
      return this.workouts.slice().reverse().slice(0,6)
    },
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
  },

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

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

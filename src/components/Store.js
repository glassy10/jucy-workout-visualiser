//import router from '../router/'
export default {
  debug: false,
  state: {
    jucyFile:{},
    jucyFileURL:'',
    db:{},
    routines:[],
    exercises:[],
    categories:[],
    workouts:[],
  },
  setJucyFileAction (newValue) {
    this.debug && console.log('setJucyFileAction triggered with', newValue)
    this.state.jucyFile = newValue
  },
  clearJucyFileAction () {
    this.debug && console.log('clearJucyFileAction triggered')
    this.state.jucyFile = {}
  },
  setJucyFileURLAction (newValue) {
    this.debug && console.log('setJucyFileURLAction triggered with', newValue)
    this.state.jucyFileURL = newValue
  },
  clearJucyFileURLAction () {
    this.debug && console.log('clearJucyFileURLAction triggered')
    this.state.jucyFileURL = {}
  },
  setDbAction (newValue) {
    this.debug && console.log('setDbAction triggered with', newValue)
    this.state.db = newValue
  },
  setRoutinesAction (newValue) {
    this.debug && console.log('setRoutinesAction triggered with', newValue)
    this.state.routines = newValue
  },
  clearRoutinesAction () {
    this.debug && console.log('clearRoutinesAction triggered')
    this.state.routines = {}
  },
  setExercisesAction (newValue) {
    this.debug && console.log('setExercisesAction triggered with', newValue)
    this.state.exercises = newValue
  },
  clearExercisesAction () {
    this.debug && console.log('clearExercisesAction triggered')
    this.state.exercises = {}
  },
  setCategoriesAction (newValue) {
    this.debug && console.log('setCategoriesAction triggered with', newValue)
    this.state.categories = newValue
  },
  clearCategoriesAction () {
    this.debug && console.log('clearCategoriesAction triggered')
    this.state.categories = {}
  },
  setWorkoutsAction (newValue) {
    this.debug && console.log('setWorkoutsAction triggered with', newValue)
    this.state.workouts = newValue
  },
  clearWorkoutsAction () {
    this.debug && console.log('clearWorkoutsAction triggered')
    this.state.categories = {}
  },


}

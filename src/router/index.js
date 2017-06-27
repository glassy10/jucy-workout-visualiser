import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
//import FileReadTest from '@/components/FileReadTest'
import Workout from '@/components/Workout'
import Exercise from '@/components/Exercise'
import LoadJucyFile from '@/components/LoadJucyFile'
import MuscleGroup from '@/components/MuscleGroupComponent'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/workout/:id',
      name: 'workout',
      component: Workout
    },
    {
      path: '/exercise/:id',
      name: 'exercise',
      component: Exercise
    },
    {
      path: '/loadjucyfile',
      name: 'loadjucyfile',
      component: LoadJucyFile
    },
    {
      path: '/mg',
      name: 'mg',
      component: MuscleGroup
    },
    // {
    //   path: '/test',
    //   name: 'fileReadTest',
    //   component: FileReadTest
    // },
    {
      path: '*',
      redirect: '/'
     }
  ]
})

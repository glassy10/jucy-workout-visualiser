<template>
  <div id="home">
    <div class="row" v-if="!storingFile">
      <div class="col-md-6">
        <h4>About</h4>
        <img  src="../../static/jucylogo.png" alt="Jucy logo" style="float:right;width:90px">
        <p>
            <a href="https://play.google.com/store/apps/details?id=com.sappadev.sappasportlog&hl=en_GB">Jucy</a>
            is an excellent android app for logging fitness workouts. It's
            simple to set up and use in the gym and has no unnecessary
            distractions.
        </p>
        <p>
           However it doesn't provide much in the way of review and analysis
           other than a simple line graph for each exercise showing reps and
           weights.
         </p>
        <p>
            Jucy records its data in a <a href="https://www.sqlite.org/">sqlite</a>
            database file which can either be automatically backed up to Google
            Drive or manually saved.
        </p>
        <p>
           This site allows you to upload that file (which should have a
           .backup extension) and create an in-depth analysis of your
            workout history.
        </p>
        <input type="file" id="fileElem" accept=".backup" style="display:none" @change="handleFiles(this.files)">
        <label for="fileElem" class="file-label">Upload Jucy file </label>
        <p>
           Files are not permanently saved (they are removed as soon as you
           close the page) and are not personally identifiable.
        </p>

      </div>
      <div class="col-md-6" style="text-align:center">
        <img  src="../../static/jucyworkout.png" alt="Jucy logo" class="img-fluid" style="max-width:300px;">
      </div>
    </div>

    <div v-if="storingFile">
      Storing file...
    </div>
  </div>
</template>

<script>

import Store from '@/components/Store'
import Utilities from '@/components/utils/Utilities'
import router from '../router/'
//see https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications re File API
export default {
  name: 'home',
  components: {
    router
  },
  data () {
    return {
      state: Store.state,
      storingFile:false
    }
  },
  computed: {
  },
  methods: {
    handleFiles: function() {
      var vm = this
      vm.storingFile = true
      Store.setJucyFileAction(document.getElementById('fileElem').files[0])
      Store.setJucyFileURLAction(window.URL.createObjectURL(vm.state.jucyFile))
      Utilities.loadBinaryFile(vm.state.jucyFileURL, function (data) {
        //eslint-disable-next-line
        Store.setDbAction(new SQL.Database(data))
        //console.log('loadjucyfile router push to home')
        router.push({path: '/'})
      })
    }
  },
  mounted() {
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.file-label {
  cursor: pointer;
  // color:rgb(2, 117, 216);
  color: rgb(255,255,255);
  background-color: rgb(31, 119, 180);
  padding: 12px;
  border-radius:5px;
}

.file-label:hover {
  background-color: rgb(51, 139, 200);
}
/*
#file-upload {
  display:table;
  width:100%;
  height:150px;
  background-color:#ccc;
  border:3px solid #eee;
  border-style: dashed;
  font-size:24px;

}
.text-cell {
  display:table-cell;
  color:#666;
  text-align: center;
  vertical-align: middle;
  font-weight:bold;
  cursor:
}

.input-file {
    opacity: 0;
    width: 100%;
    height: 150px;
    position: absolute;
    cursor: pointer;
  }

#file-upload:hover {
    background: lightblue;
  }
*/

</style>

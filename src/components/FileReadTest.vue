<template>
  <div id="file-read-test">

    <input type="file" id="fileElem" accept=".backup" style="display:none" @change="handleFiles(this.files)">
    <label for="fileElem" class="file-label">Select your Jucy back up file </label>
    <br/><br/>
    Selected file name:
    {{selectedFile.name}}<br/>
    Selected file size:
    {{selectedFile.size}}<br/>
    Selected file type:
    {{selectedFile.type}}<br/>
    Selected file Last Modified Date:
    {{selectedFile.lastModifiedDate}}<br/>
    <hr/>



  </div>
</template>

<script>

import Utilities from '@/components/utils/Utilities'


export default {
  name: 'file-read-test',
  components: {

  },
  data () {
    return {
      selectedFile:{},
      routines:[]
    }
  },
    computed: {
    },
    methods: {
      handleFiles: function() {
        var vm = this
        this.selectedFile = document.getElementById('fileElem').files[0];
        console.log(this.selectedFile)
        var objectURL = window.URL.createObjectURL(this.selectedFile);
        console.log('objectURL',objectURL)



        Utilities.loadBinaryFile(objectURL, function (data) {
          //eslint-disable-next-line
          var db = new SQL.Database(data)
          var routinesSQL = 'select * from routines'
          vm.routines = Utilities.sqlJsonify(db.exec(routinesSQL))
          console.log('vm.routines',JSON.stringify(vm.routines))
        })


      }
    },
    mounted() {
    },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.file-label {
  cursor: pointer;
  color:rgb(2, 117, 216);
}

</style>

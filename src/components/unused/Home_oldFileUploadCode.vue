<template>
  <div id="home">
    <br/>
    <div class="row">
      <div class="col-md-6">
        <h3>About Jucy</h3>
        <p><a href="https://play.google.com/store/apps/details?id=com.sappadev.sappasportlog&hl=en_GB">Jucy</a>
           is an android app for logging fitness workouts.</p>
        <p>It's an excellent app for use in the gym - it's very simple to set up
            and use and there are no annoying ads or other distractions. However it
            doesn't provide much in the way of review and analysis facilities other
            than a rudimentary line graph for each exercise showing reps and weights.</p>

        <p>Jucy records it data into a sqlite database file which can be seamlessly
            backed up to Google Drive. This page allows you to upload that file and
            view more in depth analysis of your workout history. Files are not
            personally identifiable and will only be examined for the purpose of
            improving the page itself.</p>

      </div>
      <div class="col-md-6">
        <h3>Upload file</h3>
        <p>Either drag your Jucy backup file from Google Drive and drop it in the box below or upload
          it using the file upload</p>
        <form enctype="multipart/form-data" novalidate v-if="isInitial || isSaving">
          <div id="file-upload">
            <input type="file" multiple :name="uploadFieldName" :disabled="isSaving"
                  @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
                  accept="image/*" class="input-file">

            <div v-if="isInitial">
              <div class="text-cell">Drop file here or click to browse for file</div>
            </div>
            <p v-if="isSaving">
              Uploading {{ fileCount }} files...
            </p>
          </div>
        </form>
        <h5>currentStatus: {{currentStatus}}</h5>


      </div>
    </div>

  </div>
</template>

<script>

import { upload } from '@/components/file-upload.fake.service'; // fake service
  // import { upload } from './file-upload.service';   // real service
import Utilities from '@/components/utils/Utilities'
const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

export default {
  name: 'home',
  components: {

  },
  data () {
    return {
      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'photos'
    }
  },
    computed: {
      isInitial() {
        return this.currentStatus === STATUS_INITIAL;
      },
      isSaving() {
        return this.currentStatus === STATUS_SAVING;
      },
      isSuccess() {
        return this.currentStatus === STATUS_SUCCESS;
      },
      isFailed() {
        return this.currentStatus === STATUS_FAILED;
      }
    },
    methods: {
      reset() {
        // reset form to initial state
        this.currentStatus = STATUS_INITIAL;
        this.uploadedFiles = [];
        this.uploadError = null;
      },
      save(formData) {
        // upload data to the server
        this.currentStatus = STATUS_SAVING;

        upload(formData)
          .then(x => {
            this.uploadedFiles = [].concat(x);
            this.currentStatus = STATUS_SUCCESS;
          })
          .catch(err => {
            this.uploadError = err.response;
            this.currentStatus = STATUS_FAILED;
          });
      },
      filesChange(fieldName, fileList) {
        // handle file changes
        const formData = new FormData();

        if (!fileList.length) return;

        // append the files to FormData
        Array
          .from(Array(fileList.length).keys())
          .map(x => {
            formData.append(fieldName, fileList[x], fileList[x].name);
          });

        // save it
        this.save(formData);
      }
    },
    mounted() {
        this.reset();
        console.log('this.currentStatus',this.currentStatus)
      },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
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
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 150px;
    position: absolute;
    cursor: pointer;
  }

#file-upload:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
  }


</style>

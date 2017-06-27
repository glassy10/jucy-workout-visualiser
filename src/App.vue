<template>
  <div id="app">

    <div class="header">
      <div class="container">

        <div class="header-links-list">
          <router-link to="/" class="header-link">Workouts</router-link>
          <router-link to="/LoadJucyFile" class="header-link">
             Reload Jucy file
            <img  src="../static/jucylogo_sm.png" alt="Jucy logo" style="width:24px;">
          </router-link>
        </div>

        <router-link to="/LoadJucyFile" class="header-link-mobile">
          <img  src="../static/jucylogo_sm.png" alt="Jucy logo" style="width:32px;">
        </router-link>

        <router-link to="/" class="navbar-brand">
          <div class="juced-header">Juced</div>
          <div class="strapline">Charts & analysis for Jucy workout logs</div>
        </router-link>


      </div>
    </div>


    <div class="container">
      <router-view></router-view>
    </div>

    <br/><br/>

    <div class="footer container">
      <div class="row">
        <div class="col-md-4">


        </div>
        <div class="col-md-4">

        </div>
        <div class="col-md-4" style="text-align:right;">
          The Jucy app and associated images and files are <b>&copy <a href="https://jirioslackapp.com/" style="color:white;">Sappa dev</a></b>
          <br/><br/>
          Juced website <b>&copy Howard Shaw 2017</b>
        </div>
      </div>



    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm';
Vue.use(BootstrapVue);

export default {
  name: 'app',
}
</script>

<style>
html {
  position: relative;
  min-height: 100%;
}
body {
  /*font-family: 'Roboto', sans-serif;*/
  font-family:-apple-system,
               BlinkMacSystemFont,
               "Segoe UI",
               Roboto,
               Oxygen,
               Ubuntu,
               Cantarell,
               "Fira Sans",
               "Droid Sans",
               "Helvetica Neue",
               sans-serif;
  font-weight:400;
  font-size:14px;
  line-height: 1.35;
  /* Margin bottom by footer height */
  margin-bottom: 60px;
}

.header {
  background-color:rgb(31, 119, 180);
  height:64px;
  padding:0 0 0 10px;
  margin-bottom:16px;
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 2px 9px 1px rgba(0, 0, 0, 0.12), 0 4px 2px -2px rgba(0, 0, 0, 0.2);
}
.header-links-list {
  display: inline-block;
  position:relative;
  margin-top:28px;
  float:right;
  display:none
}
.header-link-mobile {
  margin-top:18px;
  float:right;
  display:none
}
@media screen and (max-width: 527px) {
    .header-link-mobile {
      display: inline-block;
    }
}
.header-links-list a:link, .header-links-list a:visited {
  color:white;
}
@media screen and (min-width: 528px) {
    .header-links-list {
      display: inline-block;
    }
}
.header-link {
  margin-left:18px
}
.juced-header { /*a:link,.juced-header a:visited*/
  color:rgb(255,255,255);
  font-size:28px;
  font-style:italic;
  font-weight:bold;
  text-shadow: 1px 1px 1px rgb(128,128,128);
  text-decoration:none;
}
.juced-header a:hover,.juced-header a:active {
  text-decoration:none;
  text-shadow: 1px 2px 3px rgb(204,204,204);
}

.strapline {
  color:white;
  font-size:12px
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  /* Set the fixed height of the footer here */
  height: 80px;
  background:rgb(31, 119, 180);
  font-size: 11px;
  color: #eee;
  padding:20px 50px
}

div.inline-item {
  display: inline-block;
  border: 1px solid #fff;
  /*width: 80px;*/
  margin:0 6px 6px 0;
  vertical-align: top;
  padding: 0;
  /*cursor: pointer;*/
  position: relative;
}
.btn {
  cursor:pointer;
}



</style>

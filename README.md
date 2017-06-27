# juced

> Gym session monitoring app for use with [Jucy](https://play.google.com/store/apps/details?id=com.sappadev.sappasportlog&hl=en_GB") back up files

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

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

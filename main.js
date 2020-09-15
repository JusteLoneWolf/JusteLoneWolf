const { Octokit } = require("@octokit/core");
const got = require('got');
const moment = require('moment');
const config  = require('./config.js');

const octokit = new Octokit({ auth: config.GITHUB_TOKEN });
const CronJob = require('cron').CronJob;
const Twit = require('twit')

const T = new Twit({
    consumer_key:         config.TCK,
    consumer_secret:      config.TCS,
    access_token:         config.TAC,
    access_token_secret:  config.TATS,
})
const job = new CronJob('*/10 * * * *', function() {
    (async () => {
        try {
            const response = await got(`http://api.openweathermap.org/data/2.5/weather?id=${config.CITY_ID}&appid=${config.WEATHER_TOKEN}`).json();
            const weather = response.weather[0].main;
            const city = response.name;
            console.log('Get information...')

            moment.locale('fr');
            await octokit.request('PATCH /user', {
                bio: `Développeur Nodejs backend\n\nMétéo actuelle à ${city} : ${weather} | Dernier update ${moment().format('LT')} | en utilisant NodeJS`
            }).then(()=>{
                console.log('Post github effectuer')
            })

            T.post('account/update_profile',{description:`Développeur Nodejs backend\n\nMétéo actuelle à ${city} : ${weather} | Dernier update ${moment().format('LT')} | en utilisant NodeJS`}, function (err, data, response) {
                console.log('Post twitter effectuer')
            })

        } catch (error) {
            console.log(error.response.body);
        }


    })();
}, null, true, 'Europe/Paris');
console.log('Lancement du job...')
job.start()
console.log('Job en attente...')

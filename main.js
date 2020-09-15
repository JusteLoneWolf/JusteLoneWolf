const { Octokit } = require("@octokit/core");
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
});
const job = new CronJob('*/10 * * * *', function() {
    (async () => {
        try {
            const weather = require('weather-js');

            weather.find({search: 'Toulouse', degreeType: 'C', lang: 'fr'}, async function (err, result) {
                if (err) console.log(err);
                console.log('Get information...')

                moment.locale('fr');
                await octokit.request('PATCH /user', {
                    bio: `Développeur Nodejs backend\n\nMétéo actuelle à Toulouse : ${result[0].current.skytext} il fait ${result[0].current.temperature}°C | Dernier update ${moment().format('LT')} | en utilisant NodeJS`
                }).then(() => {
                    console.log('Post github effectuer')
                })

                T.post('account/update_profile', {description: `Développeur Nodejs backend\n\nMétéo actuelle à Toulouse : ${result[0].current.skytext} il fait ${result[0].current.temperature}°C | Dernier update ${moment().format('LT')} | en utilisant NodeJS`}, function (err, data, response) {
                    console.log('Post twitter effectuer')
                })
            });
        } catch (error) {
            console.log(error);
        }


    })();
}, null, true, 'Europe/Paris');
console.log('Lancement du job...')
job.start()
console.log('Job en attente...')

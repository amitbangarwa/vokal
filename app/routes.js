/**
 * Created by amit on 03/06/17.
 */
const controllers = require('./controllers');
const userController = controllers.user;

module.exports = (app) => {

    app.get('/', (req, res) => {
        res.render('index.html');
    });

    app.get('/app/*', (req, res) => {
        res.render('index.html');
    });

    app.get('/auth.html', (req, res) => {
        res.render('./partials/auth.html');
    });

    app.get('/dashboard.html', (req, res) => {
        res.render('./partials/dashboard.html');
    });

    app.get('/searchDetails.html', (req, res) => {
        res.render('./partials/searchDetails.html');
    });

    app.post('/auth/login', userController.login);

    app.post('/auth/signup', userController.signup);

};
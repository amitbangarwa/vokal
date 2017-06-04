/**
 * Created by amit on 03/06/17.
 */
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const router = express.Router();

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json({
    limit: '10mb'
})); // support json encoded bodies

app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
})); // support encoded bodies

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

require('./app/routes')(app);

require('./app/api/apis')(router);

app.use('/api/v1', router);

require('./app/modules/404')(app);

app.listen(3300, 'localhost', () => console.log("App listening on port 3000"));
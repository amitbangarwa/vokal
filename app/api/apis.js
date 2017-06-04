/**
 * Created by amit on 03/06/17.
 */
const authentication = require('../api/authentication');
const controllers = require('../controllers');
const searchController = controllers.search;

module.exports = (router) => {

    router.route('/search')
        .post(authentication, searchController.create)
        .get(authentication, searchController.get)

};
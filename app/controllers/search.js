/**
 * Created by amit on 04/06/17.
 */
const Search = require('../models').SearchDetails;

module.exports = {
    create(req, res) {
        let postData = req.body;
        postData.userId = req.decoded.id;
        return Search
            .create(postData)
            .then(search => res.status(200).send(search))
            .catch(error => res.status(400).send(error));
    },
    get(req, res) {
        return Search
            .findAll({
                where: {
                    userId: req.decoded.id
                }
            })
            .then(search => res.status(200).send(search))
            .catch(error => res.status(400).send(error));
    }
};

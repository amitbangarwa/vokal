'use strict';
module.exports = function(sequelize, DataTypes) {
  var SearchDetails = sequelize.define('SearchDetails', {
    sId: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    icon: DataTypes.STRING,
    location: DataTypes.JSONB,
    rating: DataTypes.INTEGER,
    phoneNumber: DataTypes.STRING,
    reviews: DataTypes.ARRAY(DataTypes.JSONB),
    viewport: DataTypes.JSONB,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return SearchDetails;
};
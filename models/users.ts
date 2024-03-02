'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // console.log(models, "models")
      // (models.users).hasMany(models.post);
      // (models.users).hasMany(models.status);
      // (models.users).hasMany(models.comments);
      // (models.users).hasMany(models.likes);
      // (models.users).hasMany(models.giveaway);
      // (models.users).hasMany(models.notification);
      // (models.users).hasMany(models.collection);
      // (models.users).hasMany(models.bookmark);
      // (models.users).hasOne(models.notification, {
      //   foreignKey: 'actionByUserId'
      // });
      // (models.users).belongsTo(models.staffrole);
            
    }
  }
  users.init({
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    phone: DataTypes.STRING,
    dob: DataTypes.STRING,
    gender: DataTypes.STRING,
    email_otp: DataTypes.STRING,
    phone_otp: DataTypes.STRING,
    email_otp_validated: DataTypes.BOOLEAN,
    phone_otp_validated: DataTypes.BOOLEAN,
    photo: DataTypes.STRING,
    status: DataTypes.INTEGER,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    picture: DataTypes.STRING,
    country: DataTypes.STRING,
    refer_by_username: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};
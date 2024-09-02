const sequelize = require('../util/database')
const Sequelize = require('sequelize')

const FileUrl = sequelize.define('FileUrl',{
    id:{
        type: Sequelize.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement: true
    },
    fileUrl : Sequelize.STRING
})

module.exports = FileUrl;
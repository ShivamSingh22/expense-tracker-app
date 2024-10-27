const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const ForgotPassword = sequelize.define('ForgotPasswordRequests',{
    id: {
        type: Sequelize.UUID,
        allowNull : false,
        primaryKey : true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    active : Sequelize.BOOLEAN,
    expiresby: Sequelize.DATE
})

module.exports = ForgotPassword;
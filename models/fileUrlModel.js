const mongoose = require('mongoose'); // Import mongoose

const fileUrlSchema = new mongoose.Schema({
    fileUrl: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const FileUrl = mongoose.model('FileUrl', fileUrlSchema);

module.exports = FileUrl;

// const FileUrl = sequelize.define('FileUrl',{
//     id:{
//         type: Sequelize.INTEGER,
//         allowNull : false,
//         primaryKey : true,
//         autoIncrement: true
//     },
//     fileUrl : Sequelize.STRING
// })

// module.exports = FileUrl;

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const CompanySchema = new Schema({
  username:String,
  company:String,
  review:String,
});


const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;

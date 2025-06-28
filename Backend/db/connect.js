require('dotenv').config();
const mongoose = require("mongoose");

const db = 'mongodb+srv://Suryabhagavan:Damithaa%401730@cluster0.w2yhhtn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connection successful');
}).catch((e) => {   
  console.log(`No connection: ${e}`);   
});

module.exports = mongoose;

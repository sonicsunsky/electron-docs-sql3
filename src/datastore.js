const Datastore = require("nedb");
const path = require("path");
console.log(__dirname);

const db = {};

db.user = new Datastore({
  autoload: true,
  filename: path.join(__dirname, "/user.db"), //指定数据库文件路径
});

db.login = new Datastore({
  autoload: true,
  filename: path.join(__dirname, "/login.db"), //指定数据库文件路径
});

export default db;

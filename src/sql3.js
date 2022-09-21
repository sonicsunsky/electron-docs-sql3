const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const sm1 = `CREATE TABLE IF NOT EXISTS doc(id INTEGER PRIMARY KEY autoincrement,name TEXT,sex TEXT,birthday TEXT,candidate_type TEXT,identity_num TEXT,company_name TEXT,company_type TEXT,contract_time TEXT,createdAt INTEGER default ${new Date().getTime()})`;
const sm2 = `CREATE TABLE IF NOT EXISTS login(id INTEGER PRIMARY KEY autoincrement,user TEXT,pwd TEXT,createdAt INTEGER default ${new Date().getTime()})`;

class Sqlite {
  constructor() {
    this.sqlInstance = null;
    this.db = null;
  }

  // 连接数据库
  connect(path) {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(path, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.db);
        }
      });
    });
  }

  // 运行sql
  run(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(1);
        }
      });
    });
  }

  // 运行sql
  run(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(1);
        }
      });
    });
  }

  // 运行多条sql
  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(1);
        }
      });
    });
  }

  // 查询一条数据
  get(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // 查询所有数据
  all(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // 关闭数据库
  close() {
    this.db.close();
  }

  // 单例
  static getInstance() {
    this.sqlInstance = this.sqlInstance ? this.sqlInstance : new Sqlite();
    return this.sqlInstance;
  }
}

const db = Sqlite.getInstance();

let dbPath = "";

dbPath =
  process.env.NODE_ENV === "development"
    ? path.join(process.cwd(), "docs.db")
    : path.resolve(__dirname, "docs.db");

console.log("dbPath: ", process.cwd(), path.resolve(__dirname, "docs.db"));

db.connect(dbPath).then(async () => {
  await db.run(sm1);
  await db.run(sm2);
});

export default db;

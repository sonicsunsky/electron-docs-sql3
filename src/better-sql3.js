const path = require("path");
const Database = require("better-sqlite3");

const dbPath =
  process.env.NODE_ENV === "development"
    ? path.join(process.cwd(), "docs.db")
    : path.resolve(__dirname, "docs.db");

console.log("dbPath: ", process.cwd(), path.resolve(__dirname, "docs.db"));

const db = new Database(dbPath, { verbose: console.log });

const sm1 = `CREATE TABLE IF NOT EXISTS doc(id INTEGER PRIMARY KEY autoincrement,name TEXT,sex TEXT,birthday TEXT,candidate_type TEXT,identity_num TEXT,company_name TEXT,company_type TEXT,contract_time TEXT,createdAt INTEGER default ${new Date().getTime()})`;
const sm2 = `CREATE TABLE IF NOT EXISTS login(id INTEGER PRIMARY KEY autoincrement,user TEXT,pwd TEXT,createdAt INTEGER default ${new Date().getTime()})`;

db.exec(sm1);
db.exec(sm2);

export default db;

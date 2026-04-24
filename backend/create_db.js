const { Client } = require('pg');

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT || 5432);
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASS || 'postgres';
const dbName = process.env.DB_NAME || 'botellas';

async function main(){
  const client = new Client({ host, port, user, password, database: 'postgres' });
  try{
    await client.connect();
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [dbName]);
    if (res.rows.length === 0) {
      console.log(`Database ${dbName} not found. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  }catch(err){
    console.error('Error creating database:', err.message || err);
    process.exitCode = 1;
  }finally{
    await client.end();
  }
}

main();

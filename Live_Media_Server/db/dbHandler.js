const { Pool } = require('pg');
const configFile = require('../configFile.js');

const pool = new Pool(configFile.camData);

dbHandler = {};

dbHandler.fetchData = async(queryString) => {
    const client = await pool.connect();
    try{
        try {
          const result = await client.query(queryString);
          return result;
        } catch (error) {
          console.error('Error executing fetchData query:', error);
          throw error;
        }
      } finally{
        client.release();
      }
};


dbHandler.fetchDataParameterized = async (queryString, params) => {
    const client = await pool.connect();
    try{
      try {
        const result = await client.query(queryString, params);
        return result;
      } catch (error) {
        console.error('Error executing fetchDataParameterized query:', error);
        throw error;
      }
    }finally{
      client.release();
    }
  };

  
module.exports = dbHandler
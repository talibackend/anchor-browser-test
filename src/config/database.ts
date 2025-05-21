import { Sequelize } from "sequelize-typescript";
import { Job } from '../models/Job';
import { Book } from '../models/Book';
import env from './env';


export const sequelize = new Sequelize(env.DB_CONNECTION_STRING, {
      logging: env.NODE_ENV == "development" ? true : false,pool: {
      max: 100,          // maximum number of connections in pool
      min: 20,           // minimum number of connections in pool
      acquire: 1000 * 60 * 5,   // maximum time (ms) that pool will try to get connection before throwing error
      idle: 1000 * 60 * 5,       // maximum time (ms) a connection can be idle before being released
    },
  });

sequelize.addModels([
    Job,
    Book
]);

Job.hasMany(Book, { as : "books", foreignKey : "job_id" });
Book.belongsTo(Job, { as : "job", foreignKey : "job_id" });
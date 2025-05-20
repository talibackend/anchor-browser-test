import { Sequelize } from "sequelize-typescript";
import { Job } from '../models/Job';
import { Book } from '../models/Book';
import env from './env';


export const sequelize = new Sequelize(env.DB_CONNECTION_STRING, {
    logging: env.NODE_ENV == "development" ? true : false,
  });

sequelize.addModels([
    Job,
    Book
]);

Job.hasMany(Book, { as : "books", foreignKey : "job_id" });
Book.belongsTo(Job, { as : "job", foreignKey : "job_id" });
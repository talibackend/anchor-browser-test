import { Table, Model, Column, DataType } from 'sequelize-typescript'
import { job_statuses } from '../utils/consts'

@Table({
    tableName: 'jobs',
    timestamps: true,
    underscored: true
})
export class Job extends Model {
    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
    public id!: number
    
    @Column({ type: DataType.STRING, allowNull: false })
    public theme!: string

    @Column({ type: DataType.STRING, allowNull: false, defaultValue: job_statuses.running })
    public status!: job_statuses 
}
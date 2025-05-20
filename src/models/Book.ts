import { Table, Model, Column, DataType } from 'sequelize-typescript'

@Table({
    tableName: 'books',
    timestamps: true,
    underscored: true
})
export class Book extends Model {
    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
    public id!: number
    
    @Column({ type: DataType.STRING, allowNull: false })
    public title!: string

    @Column({ type: DataType.STRING, allowNull: false })
    public author!: string

    @Column({ type: DataType.TEXT, allowNull: false })
    public desc!: string

    @Column({ type : DataType.TEXT, allowNull : false })
    public summary!: string

    @Column({ type: DataType.DECIMAL(65, 2), allowNull: false })
    public current_price!: number

    @Column({ type: DataType.DECIMAL(65, 2), allowNull: false })
    public original_price!: number

    @Column({ type : DataType.DECIMAL(65, 2), defaultValue : 0 })
    public discount_amount!: number

    @Column({ type : DataType.INTEGER, defaultValue : 0 })
    public discount_percent!: number

    @Column({ type : DataType.STRING, allowNull: false })
    public url!: string

    @Column({ type : DataType.INTEGER, allowNull : false })
    public relevance_score!: number

    @Column({ type : DataType.INTEGER, allowNull : false })
    public value_score!: number
}
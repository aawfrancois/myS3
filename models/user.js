import { Model } from 'sequelize';
import bcrypt from 'bcrypt';

const MIN_PWD_LENGTH = 7;

export default class User extends Model {
    static init(sequelize, DataTypes) {
        return super.init(
            {
                uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    validate: { isEmail: true },
                    unique: {
                        args: true,
                        msg: 'email aready in use',
                    },
                },
                nickname: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: { args: true, msg: 'nickname already exists' },
                },
                password: {
                    type: DataTypes.VIRTUAL,
                    validate: {
                        isLongEnough(value) {
                            if (value.length < MIN_PWD_LENGTH) {
                                throw new Error('password is too short');
                            }
                        },
                    },
                },
                password_confirmation: {
                    type: DataTypes.VIRTUAL,
                    validate: {
                        isEqual(value) {
                            if (this.password !== value) {
                                throw new Error("passwords don't match");
                            }
                        },
                    },
                },
                password_digest: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    validate: { notEmpty: true },
                },
            },

            {
                sequelize,
                tableName: 'users',
                hooks: {
                    async beforeValidate(user) {
                        if (user.isNewRecord) {
                            const SALT_ROUND = 7;
                            const hash = await bcrypt.hash(user.password, SALT_ROUND);

                            if (hash === null) {
                                throw new Error("can't hash password");
                            }
                            user.password_digest = hash;
                        }
                    },
                    async beforeSave(user, options){
                        if (user.changed('password')) {
                            if (user.password !== user.password_confirmation) {
                                throw new Error("passwords don't match");
                            }
                        }
                    },
                },
            },
        );
    }

    async checkPwd(password) {
        return await bcrypt.compare(password, this.password_digest);
    }

    toJSON() {
        const values = Object.assign({}, this.get());
        delete values.password_digest;
        delete values.password;
        delete values.password_confirmation;
        return values;
    }
}
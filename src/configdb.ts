import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'learn_nest',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
};

export default config;

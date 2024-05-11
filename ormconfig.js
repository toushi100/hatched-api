/* eslint-disable */
const   dotenv  =   require('dotenv');

dotenv.config({ path: `./env/${process.env.NODE_ENV || 'development'}.env` });

function isTrue(value) {
    return value === 'true';
}

const {
    DATABASE_TYPE,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_NAME,
    TYPEORM_SYNCHRONIZE,
    TYPEORM_MIGRATIONS
}= process.env

module.exports = {
    type: DATABASE_TYPE,
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    entities: [`dist/{modules,shared}/**/*.entity{.ts,.js}`],
    synchronize: isTrue(TYPEORM_SYNCHRONIZE),
    migrations: [`dist/migrations/**/*.js`],
    migrationsRun: isTrue(TYPEORM_MIGRATIONS),
    cli: {
        migrationsDir: `src/migrations`,
        entitiesDir: `src/{modules,shared}/**/*.entity{.ts,.js}`,
    },
    logging: 'all',
    ssl: {
        rejectUnauthorized: false
    },
};

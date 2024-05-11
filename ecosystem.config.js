module.exports = {
    apps: [
        {
            name: 'app',
            script: './dist/main.js',
            env: {
                NODE_ENV: 'development',
                PORT: 5000,
            },
            env_production: { // eslint-disable-line
                NODE_ENV: 'production',
                PORT: 5000,
            },
        },
    ],
};

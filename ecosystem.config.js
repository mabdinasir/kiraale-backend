/* eslint-disable camelcase */

module.exports = {
    apps: [
        {
            name: 'eastleighrealestate',
            script: 'dist/main.js',
            instances: 'max',
            exec_mode: 'cluster',
            watch: false,
        },
    ],
}

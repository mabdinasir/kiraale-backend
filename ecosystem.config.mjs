/* eslint-disable camelcase */

export default {
    apps: [
        {
            name: 'eastleighrealestate',
            script: 'dist/main.js',
            instances: 'max',
            exec_mode: 'cluster',
            watch: true,
        },
    ],
}

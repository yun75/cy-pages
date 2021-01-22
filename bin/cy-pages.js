#!/usr/bin/env node
// console.log(process.argv);
process.argv.push('--cwd')
process.argv.push(process.cwd())
process.argv.push('--gulpfile')
process.argv.push(require.resolve('..')); // ../bin/index.js, 自动找package.json 中的main字段

// console.log(process.argv);
require('gulp/bin/gulp');
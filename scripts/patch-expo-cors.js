const fs = require('fs');
const path = require('path');

const corsFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'middleware',
  'CorsMiddleware.js'
);

if (!fs.existsSync(corsFile)) {
  console.log('[patch-expo-cors] CorsMiddleware.js not found, skipping patch');
  process.exit(0);
}

const patched = `"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    _isLocalHostname: function() {
        return _isLocalHostname;
    },
    createCorsMiddleware: function() {
        return createCorsMiddleware;
    }
});
const _isLocalHostname = (hostname)=>{
    return true;
};
function createCorsMiddleware(exp) {
    return (req, res, next)=>{
        if (typeof req.headers.origin === 'string') {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        }
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    };
}

//# sourceMappingURL=CorsMiddleware.js.map
`;

fs.writeFileSync(corsFile, patched, 'utf-8');
console.log('[patch-expo-cors] Successfully patched CorsMiddleware.js to allow all origins');

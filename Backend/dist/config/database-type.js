"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSql = exports.isMongo = exports.getDatabaseType = void 0;
const getDatabaseType = () => process.env.DATABASE_TYPE ?? 'mongodb';
exports.getDatabaseType = getDatabaseType;
const isMongo = () => (0, exports.getDatabaseType)() === 'mongodb';
exports.isMongo = isMongo;
const isSql = () => !(0, exports.isMongo)();
exports.isSql = isSql;
//# sourceMappingURL=database-type.js.map
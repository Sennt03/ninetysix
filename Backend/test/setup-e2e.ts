// Se ejecuta ANTES de importar AppModule, por eso fija DATABASE_TYPE aquí
// (de él dependen los providers condicionales de cada módulo).
process.env.NODE_ENV = 'test';
process.env.DATABASE_TYPE = 'mongodb';
process.env.ENABLE_SOCKETS = 'false';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
// MONGODB_URI lo fija el propio test tras levantar MongoMemoryServer.
process.env.MONGODB_URI = 'mongodb://placeholder/test';

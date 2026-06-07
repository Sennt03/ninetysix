export type DatabaseType = 'mongodb' | 'postgres' | 'mysql';
export declare const getDatabaseType: () => DatabaseType;
export declare const isMongo: () => boolean;
export declare const isSql: () => boolean;

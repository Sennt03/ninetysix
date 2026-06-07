import { DatabaseType } from './database-type';
export interface AppConfig {
    env: string;
    port: number;
    apiPrefix: string;
    corsOrigins: string[] | boolean;
    database: {
        type: DatabaseType;
        mongoUri?: string;
        url?: string;
    };
    jwt: {
        accessSecret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    bcryptSaltRounds: number;
    enableSockets: boolean;
    throttle: {
        ttl: number;
        limit: number;
    };
    uploads: {
        dir: string;
        publicUrl: string;
    };
}
declare const _default: () => AppConfig;
export default _default;

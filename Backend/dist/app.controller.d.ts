export declare class AppController {
    health(): {
        status: string;
        database: import("./config/database-type").DatabaseType;
        sockets: boolean;
        uptime: number;
        timestamp: string;
    };
}

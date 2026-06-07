import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    private readonly isDev;
    catch(exception: unknown, host: ArgumentsHost): void;
}

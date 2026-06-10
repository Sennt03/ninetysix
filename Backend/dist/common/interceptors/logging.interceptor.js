"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const SLOW_REQUEST_MS = 1000;
const isProd = process.env.NODE_ENV === 'production';
let LoggingInterceptor = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const { method, originalUrl } = req;
        const start = Date.now();
        return next.handle().pipe((0, operators_1.tap)(() => {
            const res = context.switchToHttp().getResponse();
            const ms = Date.now() - start;
            const noisy = isProd && res.statusCode < 400 && ms < SLOW_REQUEST_MS;
            if (noisy)
                return;
            const line = `${method} ${originalUrl} ${res.statusCode} +${ms}ms`;
            if (res.statusCode >= 400)
                this.logger.warn(line);
            else
                this.logger.log(line);
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map
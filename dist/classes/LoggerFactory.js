import log4js from 'log4js';
import { Constant } from '../static/Constant.js';
export class LoggerFactory {
    config;
    constructor(reportAppenderModule) {
        this.config = {
            appenders: {
                console: {
                    type: 'console',
                },
                file: {
                    type: 'file',
                    filename: Constant.LogFilename,
                    maxLogSize: 1048576,
                    backups: 10,
                    keepFileExt: true,
                },
                report: {
                    type: reportAppenderModule,
                },
            },
            categories: {
                default: {
                    appenders: Constant.LogFilename ? ['console', 'file', 'report'] : ['console', 'report'],
                    level: Constant.LogLevel,
                },
            },
        };
    }
    getLogger(categoryName) {
        return log4js.configure(this.config).getLogger(categoryName);
    }
}

import log4js from 'log4js';
import { LOG_FILENAME, LOG_LEVEL } from './const';
import { reportAppenderModule } from './reporter';
const config = {
    appenders: {
        console: {
            type: 'console',
        },
        file: {
            type: 'file',
            filename: `${LOG_FILENAME}.log`,
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
            appenders: LOG_FILENAME ? ['console', 'file', 'report'] : ['console', 'report'],
            level: LOG_LEVEL,
        },
    },
};
log4js.configure(config);
export const logger = log4js.getLogger('Shard Allocater');

import log4js from 'log4js';
import { LOG_FILENAME, LOG_LEVEL } from './const.js';
import { reportAppenderModule } from './reporter.js';

const config: log4js.Configuration = {
	appenders: {
		console: {
			type: 'console',
		},
		file: {
			type: 'file',
			filename: LOG_FILENAME,
			maxLogSize: 1048576,	// 1MB
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

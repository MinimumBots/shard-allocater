import log4js from 'log4js';
import { Constants } from '../static/Constants.js';

export class LoggerFactory {
	private readonly config: log4js.Configuration;

	public constructor(reportAppenderModule: log4js.AppenderModule) {
		this.config = {
			appenders: {
				console: {
					type: 'console',
				},
				file: {
					type: 'file',
					filename: Constants.LogFilename,
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
					appenders: Constants.LogFilename ? ['console', 'file', 'report'] : ['console', 'report'],
					level: Constants.LogLevel.toLowerCase(),
				},
			},
		};
	}

	public getLogger(categoryName: string): log4js.Logger {
		return log4js.configure(this.config).getLogger(categoryName);
	}
}

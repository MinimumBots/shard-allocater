import { Constants } from '../static/Constants.js';
import { EmbedBuilder, WebhookClient, codeBlock } from 'discord.js';
import { format } from 'util';

import type { AppenderFunction, AppenderModule, LoggingEvent } from 'log4js';
import type { LogLevel, OrderedLogLevel } from '../types.js';

export class Reporter {
	private static readonly colors: Record<LogLevel, number> = {
		TRACE: 0xe6e7e8,
		DEBUG: 0x1587bf,
		INFO: 0x67b160,
		WARN: 0xff922e,
		ERROR: 0xed3544,
		FATAL: 0x9867c6,
	};

	private readonly logLevel: LogLevel;
	private readonly orderedLogLevel: OrderedLogLevel = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

	private readonly webhookClient: WebhookClient | null = Constants.ReportWebhookUrl
		? new WebhookClient({ url: Constants.ReportWebhookUrl })
		: null;

	public readonly appenderModule: AppenderModule = {
		configure: (): AppenderFunction => {
			return (event: LoggingEvent) => this.report(event);
		},
	};

	public constructor(logLevel: LogLevel) {
		this.logLevel = logLevel;
	}

	private report(event: LoggingEvent): void {
		const logLevel = event.level.levelStr as LogLevel;

		if (!this.webhookClient || this.isAboveLogLevel(logLevel)) {
			return;
		}

		const embed: EmbedBuilder = new EmbedBuilder()
			.setColor(Reporter.colors[logLevel])
			.setAuthor({ name: event.categoryName })
			.setDescription(codeBlock('ansi', format(...event.data)))
			.setFooter({ text: logLevel })
			.setTimestamp(event.startTime);

		this.webhookClient.send({ embeds: [embed] })
			.catch(() => {});
	}

	private isAboveLogLevel(logLevel: LogLevel): boolean {
		return this.orderedLogLevel.indexOf(this.logLevel) > this.orderedLogLevel.indexOf(logLevel);
	}
}

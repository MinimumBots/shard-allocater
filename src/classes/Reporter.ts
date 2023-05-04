import { Constant } from '../static/Constant.js';
import { EmbedBuilder, WebhookClient, codeBlock } from 'discord.js';
import { format } from 'util';

import type { AppenderFunction, AppenderModule, LoggingEvent } from 'log4js';
import type { LogLevel } from '../types.js';

export class Reporter {
	private static readonly colors: Record<LogLevel, number> = {
		TRACE: 0xe6e7e8,
		DEBUG: 0x1587bf,
		INFO: 0x67b160,
		WARN: 0xff922e,
		ERROR: 0xed3544,
		FATAL: 0x9867c6,
	};

	private readonly webhookClient: WebhookClient | null = Constant.ReportWebhookUrl
		? new WebhookClient({ url: Constant.ReportWebhookUrl })
		: null;

	public readonly appenderModule: AppenderModule = {
		configure: (): AppenderFunction => {
			return (event: LoggingEvent) => this.report(event);
		},
	};

	public constructor() {}

	private report(event: LoggingEvent): void {
		if (!this.webhookClient) {
			return;
		}
	
		const embed: EmbedBuilder = new EmbedBuilder()
			.setColor(Reporter.colors[event.level.levelStr as LogLevel])
			.setAuthor({ name: event.categoryName })
			.setDescription(codeBlock(format(...event.data)))
			.setFooter({ text: event.level.levelStr })
			.setTimestamp(event.startTime);
	
		this.webhookClient.send({ embeds: [embed] })
			.catch(() => {});
	}
}

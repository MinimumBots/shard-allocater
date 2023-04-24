import { EmbedBuilder, WebhookClient, codeBlock } from 'discord.js'
import { REPORT_WEBHOOK_URL } from './const';
import { LogLevel } from './types';
import { format } from 'util';

import type { AppenderFunction, AppenderModule, LoggingEvent } from 'log4js';

const colors: Record<LogLevel, number> = {
	trace: 0xe6e7e8,
	debug: 0x1587bf,
	info: 0x67b160,
	warn: 0xff922e,
	error: 0xed3544,
	fatal: 0x9867c6,
};

const webhook = REPORT_WEBHOOK_URL ? new WebhookClient({ url: REPORT_WEBHOOK_URL }) : null;

const report = (event: LoggingEvent): void => {
	if (!webhook) {
		return;
	}

	const embed: EmbedBuilder = new EmbedBuilder()
		.setColor(colors[event.level.levelStr as LogLevel])
		.setAuthor({ name: event.categoryName })
		.setDescription(codeBlock(format(...event.data)))
		.setFooter({ text: event.level.toString() })
		.setTimestamp(event.startTime);

	webhook.send({ embeds: [embed] })
		.catch(() => {});
}

export const reportAppenderModule: AppenderModule = {
	configure: (): AppenderFunction => {
		return (event: LoggingEvent) => report(event);
	}
}

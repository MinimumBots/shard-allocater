import { EmbedBuilder, WebhookClient, codeBlock } from 'discord.js';
import { REPORT_WEBHOOK_URL } from './const.js';
import { format } from 'util';
const colors = {
    TRACE: 0xe6e7e8,
    DEBUG: 0x1587bf,
    INFO: 0x67b160,
    WARN: 0xff922e,
    ERROR: 0xed3544,
    FATAL: 0x9867c6,
};
const webhook = REPORT_WEBHOOK_URL ? new WebhookClient({ url: REPORT_WEBHOOK_URL }) : null;
const report = (event) => {
    if (!webhook) {
        return;
    }
    const embed = new EmbedBuilder()
        .setColor(colors[event.level.levelStr])
        .setAuthor({ name: event.categoryName })
        .setDescription(codeBlock(format(...event.data)))
        .setFooter({ text: event.level.levelStr })
        .setTimestamp(event.startTime);
    webhook.send({ embeds: [embed] })
        .catch(() => { });
};
export const reportAppenderModule = {
    configure: () => {
        return (event) => report(event);
    }
};

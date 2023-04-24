import { EmbedBuilder, WebhookClient, codeBlock } from 'discord.js';
import { REPORT_WEBHOOK_URL } from './const';
import { format } from 'util';
const colors = {
    trace: 0xe6e7e8,
    debug: 0x1587bf,
    info: 0x67b160,
    warn: 0xff922e,
    error: 0xed3544,
    fatal: 0x9867c6,
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
        .setFooter({ text: event.level.toString() })
        .setTimestamp(event.startTime);
    webhook.send({ embeds: [embed] })
        .catch(() => { });
};
export const reportAppenderModule = {
    configure: () => {
        return (event) => report(event);
    }
};

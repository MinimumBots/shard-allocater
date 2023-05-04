import { Constant } from '../static/Constant.js';
import { EmbedBuilder, WebhookClient, codeBlock } from 'discord.js';
import { format } from 'util';
class Reporter {
    static colors = {
        TRACE: 0xe6e7e8,
        DEBUG: 0x1587bf,
        INFO: 0x67b160,
        WARN: 0xff922e,
        ERROR: 0xed3544,
        FATAL: 0x9867c6,
    };
    webhookClient = Constant.ReportWebhookUrl
        ? new WebhookClient({ url: Constant.ReportWebhookUrl })
        : null;
    appenderModule = {
        configure: () => {
            return (event) => this.report(event);
        },
    };
    constructor() { }
    report(event) {
        if (!this.webhookClient) {
            return;
        }
        const embed = new EmbedBuilder()
            .setColor(Reporter.colors[event.level.levelStr])
            .setAuthor({ name: event.categoryName })
            .setDescription(codeBlock(format(...event.data)))
            .setFooter({ text: event.level.levelStr })
            .setTimestamp(event.startTime);
        this.webhookClient.send({ embeds: [embed] })
            .catch(() => { });
    }
}
export { Reporter };

import dotenv from 'dotenv';
dotenv.config();
class Constant {
    static BotPath = (() => {
        const path = process.argv.at(2);
        if (!path) {
            throw new RangeError('The "BOT_PATH" is not specified.');
        }
        return path;
    })();
    static LogLevel = process.env['LOG_LEVEL'] ?? 'info';
    static LogFilename = process.env['LOG_FILENAME'] ?? null;
    static DiscordToken = (() => {
        const token = process.env['DISCORD_TOKEN'];
        if (!token) {
            throw new RangeError('The "DISCORD_TOKEN" is not specified.');
        }
        return token;
    })();
    static ShardCount = Number(process.env['SHARD_COUNT']) || null;
    static ShardList = (process.env['SHARD_LIST']?.split(',').map(Number) ?? null);
    static ShardSpawnTimeout = Number(process.env['SHARD_SPAWN_TIMEOUT']) || null;
    static ShardReconnectTimeout = Number(process.env['SHARD_RECONNECT_TIMEOUT']) || null;
    static ReportWebhookUrl = process.env['REPORT_WEBHOOK_URL'] ?? null;
}
export { Constant };

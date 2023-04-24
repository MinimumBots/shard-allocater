export const BOT_PATH = (() => {
    const path = process.argv.at(2);
    if (!path) {
        throw new RangeError('The "BOT_PATH" is not specified.');
    }
    return path;
})();
export const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'info';
export const LOG_FILENAME = process.env['LOG_LEVEL'] ?? null;
export const DISCORD_TOKEN = (() => {
    const token = process.env['DISCORD_TOKEN'];
    if (!token) {
        throw new RangeError('The "DISCORD_TOKEN" is not specified.');
    }
    return token;
})();
export const SHARD_COUNT = Number(process.env['SHARD_COUNT']) || null;
export const SHARD_LIST = (process.env['SHARD_LIST']?.split(',').map(Number) ?? 'auto');
export const REPORT_WEBHOOK_URL = process.env['SHARD_COUNT'] ?? null;

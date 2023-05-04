import dotenv from 'dotenv';

dotenv.config();

export class Constant {
	public static readonly BotPath: string = (() => {
		const path = process.argv.at(2);

		if (!path) {
			throw new RangeError('The "BOT_PATH" is not specified.');
		}

		return path;
	})();

	public static readonly LogLevel: string = process.env['LOG_LEVEL'] ?? 'info';

	public static readonly LogFilename: string | null = process.env['LOG_FILENAME'] ?? null;

	public static readonly DiscordToken: string = (() => {
		const token = process.env['DISCORD_TOKEN'];

		if (!token) {
			throw new RangeError('The "DISCORD_TOKEN" is not specified.');
		}

		return token;
	})();

	public static readonly ShardCount: number | null = Number(process.env['SHARD_COUNT']) || null;

	public static readonly ShardList: number[] | null = (
		process.env['SHARD_LIST']?.split(',').map(Number) ?? null
	);

	public static readonly ShardSpawnTimeout: number | null = Number(process.env['SHARD_SPAWN_TIMEOUT']) || null;

	public static readonly ShardReconnectTimeout: number | null = Number(process.env['SHARD_RECONNECT_TIMEOUT']) || null;

	public static readonly ReportWebhookUrl: string | null = process.env['REPORT_WEBHOOK_URL'] ?? null;
}

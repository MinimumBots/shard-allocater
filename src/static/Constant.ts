import dotenv from 'dotenv';
import { LogLevel } from '../types';

dotenv.config();

export class Constant {
	public static readonly BotPath: string = (() => {
		const path = process.argv.at(2);

		if (!path) {
			throw new RangeError('The "BOT_PATH" is not specified.');
		}

		return path;
	})();

	public static readonly LogLevel: string = process.env['LOG_LEVEL'] ?? 'INFO';

	public static readonly LogFilename: string | null = process.env['LOG_FILENAME'] ?? null;

	public static readonly DiscordToken: string = (() => {
		const token = process.env['DISCORD_TOKEN'];
		if (!token) {
			throw new RangeError('The "DISCORD_TOKEN" is not specified.');
		}

		return token;
	})();

	public static readonly ShardCount: number | null = Number(this.sanitizeNumber(process.env['SHARD_COUNT'])) || null;

	public static readonly ShardList: number[] | null = (
		process.env['SHARD_LIST']?.split(',').map(Number) ?? null
	);

	public static readonly ShardSpawnTimeout: number | null = Number(this.sanitizeNumber(process.env['SHARD_SPAWN_TIMEOUT'])) || null;

	public static readonly ShardRecoveryTimeout: number | null = Number(this.sanitizeNumber(process.env['SHARD_RECOVERY_TIMEOUT'])) || null;

	public static readonly ReportWebhookUrl: string | null = process.env['REPORT_WEBHOOK_URL'] ?? null;

	public static readonly ReportStatusInterval: number | null = Number(this.sanitizeNumber(process.env['REPORT_STATUS_INTERVAL'])) || null;

	public static readonly ReportLogLevel: LogLevel = (process.env['REPORT_LOG_LEVEL'] ?? 'INFO') as LogLevel;

	private static sanitizeNumber(value: string | undefined): string | undefined {
		return value
			? value.trim().replaceAll('_', '')
			: undefined;
	}
}

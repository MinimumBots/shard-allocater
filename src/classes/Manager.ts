import { Constant } from '../static/Constant.js';
import { setTimeout } from 'timers/promises';
import { ShardEvents, ShardingManager, fetchRecommendedShardCount } from 'discord.js';

import type { Logger } from 'log4js';
import type { Shard } from 'discord.js';

export class Manager {
	private readonly logger: Logger;

	private readonly shardReconnectingFlags: Map<number, boolean> = new Map();

	private shardingManager: ShardingManager | null = null;

	private isAllReady: boolean = false;

	public constructor(logger: Logger) {
		this.logger = logger;
	}

	public async up(): Promise<void> {
		await this.setup();
		this.spawn();
	}

	public down(): void {
		this.logger.info('Terminate all shards.');

		this.shardingManager?.shards.forEach((shard) => shard.kill());
	}

	private async setup(): Promise<void> {
		this.shardingManager = await this.createShardingManager();

		this.setShardEvents();
	}

	private spawn(): void {
		this.logger.info('Start spawning shards.');

		this.shardingManager?.spawn({ timeout: Constant.ShardSpawnTimeout ?? -1 })
			.then(() => this.logger.debug('All shards were spawned.'))
			.catch((error) => this.logger.error(error));
	}

	private async createShardingManager(): Promise<ShardingManager> {
		const shardCount: number = Constant.ShardCount ?? await fetchRecommendedShardCount(Constant.DiscordToken);

		return new ShardingManager(
			Constant.BotPath,
			{
				token: Constant.DiscordToken,
				totalShards: shardCount,
				shardList: Constant.ShardList ?? 'auto',
			},
		);
	}

	private setShardEvents(): void {
		const totalShards: number = Number(this.shardingManager?.totalShards);

		this.shardingManager?.on('shardCreate', (shard) => {
			shard
				.on(ShardEvents.Spawn, () => this.receiveShardSpawn(shard, totalShards))
				.on(ShardEvents.Ready, () => this.receiveShardReady(shard))
				.on(ShardEvents.Disconnect, () => this.receiveShardDisconnect(shard))
				.on(ShardEvents.Reconnecting, () => this.receiveShardReconnecting(shard))
				.on(ShardEvents.Death, () => this.receiveShardDeath(shard))
				.on(ShardEvents.Error, (error) => this.receiveShardError(shard, error));
		});
	}

	private receiveShardSpawn(shard: Shard, totalShards: number): void {
		this.logger.debug(`Shard ${shard.id + 1}/${totalShards} spawned.`);
	}

	private receiveShardReady(shard: Shard): void {
		this.logger.info(`#${shard.id} shard turns ready.`);

		this.checkAllReady();

		this.shardReconnectingFlags.set(shard.id, false);
	}

	private receiveShardDisconnect(shard: Shard): void {
		this.logger.warn(`#${shard.id} shard is WebSocket disconnects and will no longer reconnect.`);
	}

	private receiveShardReconnecting(shard: Shard): void {
		this.logger.info(`#${shard.id} shard is attempting to reconnect or re-identify.`);

		if (this.shardReconnectingFlags.get(shard.id)) {
			return;
		}

		if (Constant.ShardReconnectTimeout) {
			setTimeout(Constant.ShardReconnectTimeout)
				.then(() => this.respawnShard(shard))
				.catch(/* ignore */);
		}

		this.shardReconnectingFlags.set(shard.id, true);
	}

	private receiveShardDeath(shard: Shard): void {
		this.logger.warn(`#${shard.id} shard is child process exiting.`);
	}

	private receiveShardError(shard: Shard, error: Error): void {
		this.logger.error(`#${shard.id} shard throw error.`, error);
	}

	private checkAllReady(): void {
		if (this.isAllReady || !this.shardingManager) {
			return;
		}

		this.isAllReady = !this.shardingManager.shards.some((shard) => !shard.ready);

		if (this.isAllReady) {
			this.logger.info('All shards are ready.');
		}
	}

	private respawnShard(shard: Shard): void {
		shard.respawn()
			.then(() => this.logger.info(`#${shard.id} shard successfully respawned.`))
			.catch(() => this.logger.fatal(`#${shard.id} shard failed to respawn.`));
	}
}

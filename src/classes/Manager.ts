import ansi from 'ansi-colors';
import { Constant } from '../static/Constant.js';
import { setInterval } from 'timers/promises';
import { ShardEvents, ShardingManager, fetchRecommendedShardCount } from 'discord.js';

import type { Logger } from 'log4js';
import type { Shard } from 'discord.js';

export class Manager {
	private readonly logger: Logger;

	private readonly faultyShardIds: Set<number> = new Set();

	private shardingManager: ShardingManager | null = null;

	private isAllSpawned: boolean = false;

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
			.then(() => {
				this.isAllSpawned = true;
				this.logger.debug('All shards were spawned.');
				this.checkAllReady();
			})
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
				.on(ShardEvents.Spawn, () => this.onShardSpawn(shard, totalShards))
				.on(ShardEvents.Ready, () => this.onShardReady(shard))
				.on(ShardEvents.Disconnect, () => this.onShardDisconnect(shard))
				.on(ShardEvents.Reconnecting, () => this.onShardReconnecting(shard))
				.on(ShardEvents.Death, () => this.onShardDeath(shard))
				.on(ShardEvents.Error, (error) => this.onShardError(shard, error));
		});
	}

	private onShardSpawn(shard: Shard, totalShards: number): void {
		this.logger.debug(`Shard ${shard.id + 1}/${totalShards} spawned.`);
	}

	private onShardReady(shard: Shard): void {
		this.logger.info(`Shard #${shard.id} turns ready.`);

		if (this.isAllSpawned) {
			this.checkAllReady();
		}
	}

	private onShardDisconnect(shard: Shard): void {
		this.logger.warn(`Shard #${shard.id} is WebSocket disconnects and will no longer reconnect.`);
	}

	private onShardReconnecting(shard: Shard): void {
		this.logger.info(`Shard #${shard.id} is attempting to reconnect or re-identify.`);
	}

	private onShardDeath(shard: Shard): void {
		this.logger.warn(`Shard #${shard.id} is child process exiting.`);
	}

	private onShardError(shard: Shard, error: Error): void {
		this.logger.error(`Shard #${shard.id} throw error.`, error);
	}

	private checkAllReady(): void {
		if (this.isAllReady || !this.shardingManager) {
			return;
		}

		this.isAllReady = !this.shardingManager.shards.some((shard) => !shard.ready);

		if (!this.isAllReady) {
			return;
		}

		this.logger.info('All shards are ready.');

		this.startMonitoring();
}

	private startMonitoring(): void {
		this.reportShardStatuses()
			.catch(/* no handling */);

		this.monitorShards()
			.catch(/* no handling */);
	}

	private async reportShardStatuses(): Promise<void> {
		if (!Constant.ReportStatusInterval || !this.shardingManager) {
			return;
		}

		for await (const _ of setInterval(Constant.ReportStatusInterval)) {
			const statuses = this.shardingManager.shards.map(
				(shard) => shard.ready ? ansi.bold.green(`[${shard.id}]`) : ansi.bold.red(`[${shard.id}]`)
			).join(' ');

			this.logger.info(`Shard statuses: ${statuses}`);
		}
	}

	private async monitorShards(): Promise<void> {
		if (!Constant.ShardRecoveryTimeout) {
			return;
		}

		for await (const _ of setInterval(Constant.ShardRecoveryTimeout)) {
			this.recoverFaultyShards();
			this.takeFaultyShards();
		}
	}

	private recoverFaultyShards(): void {
		[...this.faultyShardIds.values()]
			.filter((id) => this.shardingManager?.shards.get(id)?.ready === false)
			.forEach((id) => this.respawnShard(id));
	}

	private takeFaultyShards(): void {
		[...(this.shardingManager?.shards.values() ?? [])]
			.filter((shard) => !shard.ready)
			.forEach((shard) => this.faultyShardIds.add(shard.id));
	}

	private respawnShard(id: number): void {
		this.shardingManager?.shards.get(id)?.respawn()
			.then(() => this.logger.info(`Shard #${id} successfully respawned.`))
			.catch(() => this.logger.fatal(`Shard #${id} failed to respawn.`));
	}
}

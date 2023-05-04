import { Constant } from '../static/Constant.js';
import { setTimeout } from 'timers/promises';
import { ShardEvents, ShardingManager, fetchRecommendedShardCount } from 'discord.js';
export class Manager {
    logger;
    shardReconnectingFlags = new Map();
    shardingManager = null;
    isAllReady = false;
    constructor(logger) {
        this.logger = logger;
    }
    async up() {
        await this.setup();
        this.spawn();
    }
    down() {
        this.logger.info('Terminate all shards.');
        this.shardingManager?.shards.forEach((shard) => shard.kill());
    }
    async setup() {
        this.shardingManager = await this.createShardingManager();
        this.setShardEvents();
    }
    spawn() {
        this.logger.info('Start spawning shards.');
        this.shardingManager?.spawn({ timeout: Constant.ShardSpawnTimeout ?? -1 })
            .then(() => this.logger.debug('All shards were spawned.'))
            .catch((error) => this.logger.error(error));
    }
    async createShardingManager() {
        const shardCount = Constant.ShardCount ?? await fetchRecommendedShardCount(Constant.DiscordToken);
        return new ShardingManager(Constant.BotPath, {
            token: Constant.DiscordToken,
            totalShards: shardCount,
            shardList: Constant.ShardList ?? 'auto',
        });
    }
    setShardEvents() {
        const totalShards = Number(this.shardingManager?.totalShards);
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
    receiveShardSpawn(shard, totalShards) {
        this.logger.debug(`Shard ${shard.id + 1}/${totalShards} spawned.`);
    }
    receiveShardReady(shard) {
        this.logger.info(`#${shard.id} shard turns ready.`);
        this.checkAllReady();
        this.shardReconnectingFlags.set(shard.id, false);
    }
    receiveShardDisconnect(shard) {
        this.logger.warn(`#${shard.id} shard is WebSocket disconnects and will no longer reconnect.`);
    }
    receiveShardReconnecting(shard) {
        this.logger.info(`#${shard.id} shard is attempting to reconnect or re-identify.`);
        if (this.shardReconnectingFlags.get(shard.id)) {
            return;
        }
        if (Constant.ShardReconnectTimeout) {
            setTimeout(Constant.ShardReconnectTimeout)
                .then(() => this.respawnShard(shard))
                .catch( /* ignore */);
        }
        this.shardReconnectingFlags.set(shard.id, true);
    }
    receiveShardDeath(shard) {
        this.logger.warn(`#${shard.id} shard is child process exiting.`);
    }
    receiveShardError(shard, error) {
        this.logger.error(`#${shard.id} shard throw error.`, error);
    }
    checkAllReady() {
        if (this.isAllReady || !this.shardingManager) {
            return;
        }
        this.isAllReady = !this.shardingManager.shards.some((shard) => !shard.ready);
        if (this.isAllReady) {
            this.logger.info('All shards are ready.');
        }
    }
    respawnShard(shard) {
        shard.respawn()
            .then(() => this.logger.info(`#${shard.id} shard successfully respawned.`))
            .catch(() => this.logger.fatal(`#${shard.id} shard failed to respawn.`));
    }
}

#!/usr/bin/env node
import { BOT_PATH, DISCORD_TOKEN, SHARD_LIST, SHARD_COUNT } from './const.js';
import { logger } from './logger.js';
import { ShardingManager, fetchRecommendedShardCount } from 'discord.js';
const shardCount = SHARD_COUNT ?? await fetchRecommendedShardCount(DISCORD_TOKEN);
const manager = new ShardingManager(BOT_PATH, {
    token: DISCORD_TOKEN,
    totalShards: shardCount,
    shardList: SHARD_LIST,
});
let readyCount = 0;
let isAllReady = false;
const checkAllReady = () => {
    readyCount++;
    if (readyCount >= shardCount) {
        logger.info('All shards are ready.');
        isAllReady = true;
    }
};
manager.on('shardCreate', (shard) => {
    shard
        .on('spawn', () => logger.debug(`Shard ${shard.id + 1}/${manager.totalShards} spawned.`))
        .on('ready', () => {
        logger.info(`No.${shard.id} shard turns ready.`);
        if (!isAllReady) {
            checkAllReady();
        }
    })
        .on('disconnect', () => logger.warn(`No.${shard.id} shard's WebSocket disconnects and will no longer reconnect.`))
        .on('reconnecting', () => logger.info(`No.${shard.id} shard is attempting to reconnect or re-identify.`))
        .on('death', () => logger.warn(`No.${shard.id} shard's child process exiting.`))
        .on('error', (error) => logger.error(error));
});
logger.info('Start spawning shards.');
manager.spawn({ timeout: 60000 })
    .then(() => logger.info('All shards were spawned.'))
    .catch((error) => logger.error(error));
const terminate = (signal) => {
    logger.warn(`A "${signal}" signal terminates all shards.`);
    manager.shards.forEach((shard) => shard.kill());
    process.exit(0);
};
process
    .on('SIGTERM', (signal) => terminate(signal))
    .on('SIGINT', (signal) => terminate(signal));

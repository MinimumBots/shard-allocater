#!/usr/bin/env node

import { LoggerFactory } from './classes/LoggerFactory.js';
import { Manager } from './classes/Manager.js';
import { Reporter } from './classes/Reporter.js';

const logger = new LoggerFactory(new Reporter().appenderModule).getLogger('Shard Allocater');

const manager = new Manager(logger);

const terminate = (signal: NodeJS.Signals): void => {
	logger.warn(`Receive "${signal}" signal.`);

	manager.down();
	process.exit(0);
}

manager.up()
	.catch(/* no handling */);

process
	.on('SIGTERM', (signal) => terminate(signal))
	.on('SIGINT', (signal) => terminate(signal));

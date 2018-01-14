#!/usr/bin/env node
'use strict';

// Update notifier.
const updateNotifier = require( 'update-notifier' );
const pkg = require( './package.json' );
const notifier = updateNotifier( {
	pkg: pkg,
	// updateCheckInterval: 1000 * 60 * 60 * 24, // 1 day.
} );

if ( notifier.update ) {
	notifier.notify();
	process.exit( 0 );
}

const spawn = require( 'cgb-dev-utils/crossSpawn' );
const args = process.argv.slice( 2 );

const scriptIndex = args.findIndex(
	// x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
	x => x === 'start' || x === 'build' || x === 'eject' || x === 'test'
);
const script = scriptIndex === -1 ? args[ 0 ] : args[ scriptIndex ];
const nodeArgs = scriptIndex > 0 ? args.slice( 0, scriptIndex ) : [];

switch ( script ) {
	case 'build':
	case 'eject':
	case 'start':
	case 'test': {
		const result = spawn.sync(
			'node',
			nodeArgs
				.concat( require.resolve( '../scripts/' + script ) )
				.concat( args.slice( scriptIndex + 1 ) ),
			{ stdio: 'inherit' }
		);
		if ( result.signal ) {
			if ( result.signal === 'SIGKILL' ) {
				console.log(
					'The build failed because the process exited too early. ' +
						'This probably means the system ran out of memory or someone called ' +
						'`kill -9` on the process.'
				);
			} else if ( result.signal === 'SIGTERM' ) {
				console.log(
					'The build failed because the process exited too early. ' +
						'Someone might have called `kill` or `killall`, or the system could ' +
						'be shutting down.'
				);
			}
			process.exit( 1 );
		}
		process.exit( result.status );
		break;
	}
	default:
		console.log( 'Unknown script "' + script + '".' );
		console.log( 'Perhaps you need to update cgb-scripts?' );
		console.log(
			'Update via: npm install -g create-guten-block or npm install cgb-scripts'
		);
		break;
}

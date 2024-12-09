import * as net from 'net';
import { LoadBalancer } from './load_balancer';

const socketServer = net.createServer();
const loadBalancerList = new LoadBalancer([
	{ host: '192.168.1.100', port: 80 },
	{ host: '192.168.1.101', port: 80 },
	{ host: '192.168.1.102', port: 80 },
]);

socketServer.on('connection', (client) => {
	console.log('new client connected');
	client.once('data', (data) => {
		const version = data[0];
		const nMethods = data[1];
		console.log('Socket version: ', version);
		client.write(Buffer.from([0x05, 0x00])); // no authentication required

		client.once('data', (request) => {
			const version = request[0];
			const cmd = request[1];
			const addressType = request[3];

			let address: string = '';
			let port: number = 0;

			if (version !== 0x05) {
				console.log('Unsupported version: ', version);
				client.end();
				return;
			}

			if (cmd !== 0x01) {
				console.log('Unsupported command: ', cmd);
				client.end();
				return;
			}

			if (addressType === 0x01) {
				address = request.slice(4, 8).join('.');
				port = request.readUInt16BE(8);
			} else if (addressType === 0x03) {
				const domainLenght = request[4];
				address = request.slice(5, 5 + domainLenght).toString();
				port = request.readUInt16BE(5 + domainLenght);
			}

			const targetServer = loadBalancerList.getNextServer();
			console.log('target server host: ', targetServer.host, 'port: ', targetServer.port);

			const destinationConnection = net.createConnection({ host: targetServer.host, port: targetServer.port }, () => {
				console.log('connected to destination');
				client.write(Buffer.from([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0]));
				destinationConnection.pipe(client);
				client.pipe(destinationConnection);
			});
		});
	});
});

socketServer.listen(8080, '0.0.0.0', () => {
	console.log('Server on port 8080');
});

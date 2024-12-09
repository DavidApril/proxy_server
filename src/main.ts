import * as os from 'os';

interface NetworkInterface {
	name: string;
	address: string;
	internal: boolean;
	family: string;
}

function is_not_loopback(Interface: os.NetworkInterfaceInfo) {
	return Interface.family === 'IPv4' && !Interface.internal;
}

function detect_interfaces() {
	const networkInterfaces = os.networkInterfaces();
	const interfaceList: NetworkInterface[] = [];

	for (const interfaceName in networkInterfaces) {
		const interfaces = networkInterfaces[interfaceName];
		if (interfaces) {
			for (const Interface of interfaces) {
				if (is_not_loopback(Interface)) {
					interfaceList.push({
						name: interfaceName,
						address: Interface.address,
						internal: Interface.internal,
						family: Interface.family,
					});
				}
			}
		}
	}

	return interfaceList;
}

const result = detect_interfaces();
console.log(result);

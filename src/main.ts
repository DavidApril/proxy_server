import * as os from 'os';

interface NetworkInterface {
	name: string;
	address: string;
	internal: boolean;
	family: string;
}

function detect_interfaces() {
	const networkInterfaces = os.networkInterfaces();
	const interfaceList: NetworkInterface[] = [];

	for (const interfaceName in networkInterfaces) {
		const interfaces = networkInterfaces[interfaceName];
		if (interfaces) {
			interfaceList.push({
				name: interfaceName,
				address: interfaces[0].address,
				internal: interfaces[0].internal,
				family: interfaces[0].family,
			});
		}
	}

	return interfaceList;
}

const result = detect_interfaces();
console.log(result);

/**
 * Copyright 2022-2023 Roman Ondráček
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Device brief info
 */
export interface Device {
	/// Device ID
	id: string;
	/// Device name
	name: string;
	/// Device MAC address
	macAddress: string;
	/// Device creation date
	createdAt: Date;
	/// Device last update
	lastSeen: Date|null;
	/// Device outputs
	outputs: DeviceOutput[];
}

/**
 * Device detailed info
 */
export interface DeviceDetail extends Device {
	/// Device outputs
	outputs: DeviceOutputWithMeasurements[];
}

export interface DeviceAdd extends DeviceModify {
	/// Device MAC address
	macAddress: string;
}

/**
 * Device add/modify
 */
export interface DeviceModify {
	/// Device name
	name: string;
	/// Device outputs
	outputs: DeviceOutput[];
}

/**
 * Device output
 */
export interface DeviceOutput {
	/// Output index
	index: number;
	/// Output name
	name: string;
}

/**
 * Device output with measurements
 */
export interface DeviceOutputWithMeasurements extends DeviceOutput {
	/// Output alert
	alert: boolean;
	/// Output state
	enabled: boolean;
	/// Output current
	current: number;
	/// Output voltage
	voltage: number;
}

/**
 * Device output measurements
 */
export interface DeviceOutputMeasurements {
	/// Output index
	index: number;
	/// Output measurements
	measurements: {
		/// Current measurements
		current: DeviceOutputMeasurement[];
		/// Voltage measurements
		voltage: DeviceOutputMeasurement[];
	};
}

/**
 * Device output measurement
 */
export interface DeviceOutputMeasurement {
	/// Measurement time
	time: Date;
	/// Measurement value
	value: number;
}

/**
 * Device output measurement received from the server
 */
export interface DeviceOutputMeasurementRaw {
	/// Measurement time
	time: string;
	/// Measurement value
	value: number;
}

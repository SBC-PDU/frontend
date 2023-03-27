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
import {AxiosResponse} from 'axios';
import {DateTime} from 'luxon';

import {ApiClient} from '@/services/ApiClient';
import {
	Device, DeviceAdd,
	DeviceDetail, DeviceModify,
	DeviceOutputMeasurement,
	DeviceOutputMeasurementRaw,
	DeviceOutputMeasurements
} from '@/types/device';

/**
 * Device service
 */
export default class DeviceService extends ApiClient {

	/**
	 * Lists all devices
	 * @return {Promise<Device[]>} List of devices
	 */
	public list(): Promise<Device[]> {
		return this.getClient().get('/devices')
			.then((response: AxiosResponse) => {
				return (response.data as Device[]).map((device: Device) => this.deserializeDevice(device));
			});
	}

	/**
	 * Adds a device
	 * @param {DeviceAdd} device Device to add
	 */
	public add(device: DeviceAdd): Promise<void> {
		return this.getClient().post('/devices', device);
	}

	/**
	 * Gets a device
	 * @param {string} id Device ID
	 * @return {Promise<DeviceDetail>} Device
	 */
	public get(id: string): Promise<DeviceDetail> {
		return this.getClient().get(`/devices/${id}`)
			.then((response: AxiosResponse) => this.deserializeDevice(response.data as DeviceDetail));
	}

	/**
	 * Edits a device
	 * @param {string} id Device ID
	 * @param {DeviceModify} device Device to edit
	 */
	public edit(id: string, device: DeviceModify): Promise<void> {
		return this.getClient().put(`/devices/${id}`, device);
	}

	/**
	 * Deletes the device
	 * @param {string} id Device ID to delete
	 */
	public delete(id: string): Promise<void> {
		return this.getClient().delete(`/devices/${id}`);
	}

	/**
	 * Returns the measurements of a device
	 * @param {string} id Device ID
	 * @param {string} timeRange Time range
	 * @return {Promise<DeviceOutputMeasurements[]>} Measurements
	 */
	public getMeasurements(id: string, timeRange: string): Promise<DeviceOutputMeasurements[]> {
		return this.getClient().get(`/devices/${id}/measurements?timeRange=${timeRange}`)
			.then((response: AxiosResponse): DeviceOutputMeasurements[] => {
				const data = response.data as DeviceOutputMeasurements[];
				for (const outputIndex in data) {
					const measurements = (data[outputIndex].measurements as unknown) as {current: DeviceOutputMeasurementRaw[], voltage: DeviceOutputMeasurementRaw[]};
					data[outputIndex].measurements.current = this.convertMeasurements(measurements.current);
					data[outputIndex].measurements.voltage = this.convertMeasurements(measurements.voltage);
				}
				return data;
			});
	}

	/**
	 * Switches an output
	 * @param {string} id Device ID
	 * @param {number} output Output index
	 * @param {boolean} state Output state
	 */
	public switchOutput(id: string, output: number, state: boolean): Promise<void> {
		return this.getClient().post(`/devices/${id}/outputs/${output}`, {
			enabled: state,
		});
	}

	/**
	 * Converts measurements to the correct format
	 * @param {DeviceOutputMeasurementRaw[]} measurements Measurements to convert
	 * @return {DeviceOutputMeasurement[]} Converted measurements
	 */
	private convertMeasurements(measurements: DeviceOutputMeasurementRaw[]): DeviceOutputMeasurement[] {
		return measurements.map((measurement) => ({
			time: DateTime.fromISO(measurement.time).toJSDate(),
			value: measurement.value,
		}));
	}


	/**
	 * Deserializes Device information from JSON
	 * @template {Device|DeviceDetail} T Device information
	 * @param {T} device Device information in JSON to deserialize
	 * @return {T} Deserialized device information
	 */
	private deserializeDevice<T extends Device|DeviceDetail>(device: T): T {
		// @ts-ignore
		device.createdAt = DateTime.fromISO(device.createdAt).toJSDate();
		// @ts-ignore
		device.lastSeen = device.lastSeen === null ? null : DateTime.fromISO(device.lastSeen).toJSDate();
		return device;
	}

}

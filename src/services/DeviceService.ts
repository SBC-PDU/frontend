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
import { type AxiosResponse } from 'axios';
import { DateTime } from 'luxon';

import { ApiClient } from '@/services/ApiClient';
import {
	type Device, type DeviceAdd,
	type DeviceDetail, type DeviceModify,
	type DeviceOutputMeasurement,
	type DeviceOutputMeasurementRaw,
	type DeviceOutputMeasurements,
} from '@/types/device';

/**
 * Device service
 */
export default class DeviceService extends ApiClient {

	/**
	 * Lists all devices
	 * @return List of devices
	 */
	public list(): Promise<Device[]> {
		return this.getClient().get('/devices')
			.then((response: AxiosResponse<Device[]>) => {
				return response.data.map((device: Device): Device => this.deserializeDevice(device));
			});
	}

	/**
	 * Adds a device
	 * @param device Device to add
	 * @return Empty promise
	 */
	public add(device: DeviceAdd): Promise<void> {
		return this.getClient().post('/devices', device);
	}

	/**
	 * Gets a device
	 * @param id Device ID
	 * @return Device information
	 */
	public get(id: string): Promise<DeviceDetail> {
		return this.getClient().get(`/devices/${id}`)
			.then((response: AxiosResponse<DeviceDetail>): DeviceDetail => this.deserializeDevice(response.data));
	}

	/**
	 * Edits a device
	 * @param id Device ID
	 * @param device Device to edit
	 * @return Empty promise
	 */
	public edit(id: string, device: DeviceModify): Promise<void> {
		return this.getClient().put(`/devices/${id}`, device);
	}

	/**
	 * Deletes the device
	 * @param id Device ID to delete
	 * @return Empty promise
	 */
	public delete(id: string): Promise<void> {
		return this.getClient().delete(`/devices/${id}`);
	}

	/**
	 * Returns the measurements of a device
	 * @param id Device ID
	 * @param timeRange Time range
	 * @return Measurements
	 */
	public getMeasurements(id: string, timeRange: string): Promise<DeviceOutputMeasurements[]> {
		return this.getClient().get(`/devices/${id}/measurements?timeRange=${timeRange}`)
			.then((response: AxiosResponse<DeviceOutputMeasurements[]>): DeviceOutputMeasurements[] => {
				const data: DeviceOutputMeasurements[] = response.data;
				for (const outputIndex in data) {
					const measurements = (data[outputIndex].measurements as unknown) as { current: DeviceOutputMeasurementRaw[], voltage: DeviceOutputMeasurementRaw[] };
					data[outputIndex].measurements.current = this.convertMeasurements(measurements.current);
					data[outputIndex].measurements.voltage = this.convertMeasurements(measurements.voltage);
				}
				return data;
			});
	}

	/**
	 * Switches an output
	 * @param id Device ID
	 * @param output Output index
	 * @param state Output state
	 * @return Empty promise
	 */
	public switchOutput(id: string, output: number, state: boolean): Promise<void> {
		return this.getClient().post(`/devices/${id}/outputs/${output}`, {
			enabled: state,
		});
	}

	/**
	 * Converts measurements to the correct format
	 * @param measurements Measurements to convert
	 * @return Converted measurements
	 */
	private convertMeasurements(measurements: DeviceOutputMeasurementRaw[]): DeviceOutputMeasurement[] {
		return measurements.map((measurement: DeviceOutputMeasurementRaw): DeviceOutputMeasurement => ({
			time: DateTime.fromISO(measurement.time).toJSDate(),
			value: measurement.value,
		}));
	}


	/**
	 * Deserializes Device information from JSON
	 * @template {Device|DeviceDetail} T Device information
	 * @param device Device information in JSON to deserialize
	 * @return Deserialized device information
	 */
	private deserializeDevice<T extends Device|DeviceDetail>(device: T): T {
		// @ts-ignore
		device.createdAt = DateTime.fromISO(device.createdAt).toJSDate();
		// @ts-ignore
		device.lastSeen = device.lastSeen === null ? null : DateTime.fromISO(device.lastSeen).toJSDate();
		return device;
	}

}

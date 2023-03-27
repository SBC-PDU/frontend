<!--
Copyright 2022-2023 Roman Ondráček

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<template>
	<Head>
		<title>{{ $t('core.devices.detail.title', {name: device?.name}) }}</title>
	</Head>
	<v-card id='info' class='mb-4'>
		<v-card-title class='bg-primary'>
			<v-icon>mdi-information-variant</v-icon>
			{{ $t('core.devices.detail.info.title') }}
			<DeviceForm
				v-if='device !== null'
				action='edit'
				:id='device.id'
			/>
		</v-card-title>
		<v-card-text>
			<v-table v-if='device !== null'>
				<tbody>
					<tr>
						<th>{{ $t('core.devices.fields.name') }}</th>
						<td>{{ device?.name }}</td>
					</tr>
					<tr>
						<th>{{ $t('core.devices.fields.macAddress') }}</th>
						<td>{{ device?.macAddress }}</td>
					</tr>
					<tr>
						<th>{{ $t('core.devices.fields.lastSeen') }}</th>
						<td>{{ $d(device?.lastSeen, 'long') }}</td>
					</tr>
				</tbody>
			</v-table>
		</v-card-text>
	</v-card>
	<v-card id='outputs' class='mb-4'>
		<v-card-title class='bg-grey'>
			<v-icon>mdi-power</v-icon>
			{{ $t('core.devices.detail.outputs.title') }}
			<v-btn
				class='float-end'
				color='primary'
				prepend-icon='mdi-refresh'
				@click='fetchData()'
			>{{ $t('core.devices.detail.outputs.reload') }}
			</v-btn>
		</v-card-title>
		<v-card-text>
			<v-table>
				<thead>
					<tr>
						<th>{{ $t('core.devices.fields.outputs.index') }}</th>
						<th>{{ $t('core.devices.fields.outputs.name') }}</th>
						<th>{{ $t('core.devices.fields.outputs.state') }}</th>
						<th>{{ $t('core.devices.fields.outputs.alert') }}</th>
						<th>{{ $t('core.devices.fields.measurements.voltage') }}</th>
						<th>{{ $t('core.devices.fields.measurements.current') }}</th>
					</tr>
				</thead>
				<tbody v-if='device !== null'>
					<tr v-for='output in device.outputs' :key='output.index'>
						<td>{{ output.index }}</td>
						<td>{{ output.name }}</td>
						<td>
							<v-switch v-model='output.enabled' color='primary' @update:model-value='switchOutput(output)'/>
						</td>
						<td>
							<v-chip :color='output.alert ? "error" : "success"'>
								{{ $t(`core.devices.fields.outputs.alertValues.${output.alert.toString()}`) }}
							</v-chip>
						</td>
						<td>{{ Number(output.voltage).toFixed(2).toString() }} V</td>
						<td>{{ Number(output.current).toFixed(2).toString() }} mA</td>
					</tr>
				</tbody>
			</v-table>
		</v-card-text>
	</v-card>
	<DeviceMeasurementChart v-if='device !== null' :device='toRaw(device)'/>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import {ref, toRaw, watchEffect} from 'vue';
import {useI18n} from 'vue-i18n';
import {toast} from 'vue3-toastify';

import DeviceMeasurementChart from '@/components/devices/DeviceMeasurementChart.vue';
import DeviceService from '@/services/DeviceService';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {DeviceDetail, DeviceOutputWithMeasurements} from '@/types/device';
import DeviceForm from '@/components/devices/DeviceForm.vue';

interface Props {
	/// PDU ID
	id: string;
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new DeviceService();
const props = defineProps<Props>();
const device = ref<DeviceDetail | null>(null);

watchEffect(async () => {
	fetchData();
});

function fetchData(showSpinner: boolean = true): void {
	if (showSpinner) {
		loadingSpinner.show();
	}
	service.get(props.id).then((response: DeviceDetail) => {
		device.value = response;
		loadingSpinner.hide();
	}).catch(() => {
		loadingSpinner.hide();
		toast.error(i18n.t('core.devices.detail.messages.fetchFailed').toString());
	});
}

/**
 * Switches the output of a device
 * @param {DeviceOutputWithMeasurements} output Output to switch
 */
function switchOutput(output: DeviceOutputWithMeasurements): Promise<void> {
	loadingSpinner.show();
	return service.switchOutput(props.id, output.index, output.enabled).then(() => {
		loadingSpinner.hide();
		setTimeout((): void => {
			fetchData(false);
		}, 3_000);
		if (output.enabled) {
			toast.success(i18n.t('core.devices.detail.outputs.messages.success.switchedOn', {
				index: output.index,
				name: output.name
			}).toString());
		} else {
			toast.success(i18n.t('core.devices.detail.outputs.messages.success.switchedOff', {
				index: output.index,
				name: output.name
			}).toString());
		}
	}).catch(() => {
		loadingSpinner.hide();
		toast.error(i18n.t('core.devices.detail.outputs.messages.switchFailed', {
			index: output.index,
			name: output.name
		}).toString());
	});
}
</script>

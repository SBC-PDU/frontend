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
	<v-alert
		v-if='state === State.Error'
		type='error'
		class='mb-4'
	>
		{{ $t('core.devices.detail.messages.fetchFailed') }}
	</v-alert>
	<v-alert
		v-if='state === State.NotFound'
		type='error'
		class='mb-4'
	>
		{{ $t('core.devices.detail.messages.notFound') }}
	</v-alert>
	<DeviceInfo v-if='device !== null' :device='device' @reload='fetchData(true)' />
	<DeviceOutputs v-if='device !== null' :device='device' @reload='fetchData(false)' />
	<DeviceMeasurementChart v-if='device !== null' :device='toRaw(device)'/>
</template>

<route lang='yaml'>
name: DeviceDetail
</route>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import {AxiosError} from 'axios';
import {ref, toRaw, watchEffect} from 'vue';
import {useI18n} from 'vue-i18n';
import {toast} from 'vue3-toastify';

import DeviceInfo from '@/components/devices/DeviceInfo.vue';
import DeviceOutputs from '@/components/devices/DeviceOutputs.vue';
import DeviceMeasurementChart from '@/components/devices/DeviceMeasurementChart.vue';
import DeviceService from '@/services/DeviceService';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {DeviceDetail} from '@/types/device';

/**
 * Device detail props
 */
interface Props {
	/// PDU ID
	id: string;
}

/**
 * Device detail states
 */
enum State {
	/// Loading
	Loading,
	/// Loaded
	Loaded,
	/// Not found
	NotFound,
	/// Error
	Error
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new DeviceService();
const props = defineProps<Props>();
const device = ref<DeviceDetail | null>(null);
const state = ref<State>(State.Loading);

watchEffect(async () => {
	fetchData();
});

/**
 * Fetch information about device
 * @param {boolean} showSpinner Show loading spinner
 */
function fetchData(showSpinner = true): void {
	state.value = State.Loading;
	if (showSpinner) {
		loadingSpinner.show();
	}
	service.get(props.id).then((response: DeviceDetail) => {
		state.value = State.Loaded;
		device.value = response;
		loadingSpinner.hide();
	}).catch((error: AxiosError) => {
		loadingSpinner.hide();
		if (error.response?.status === 404) {
			state.value = State.NotFound;
		} else {
			toast.error(i18n.t('core.devices.detail.messages.fetchFailed').toString());
			state.value = State.Error;
		}
	});
}

</script>

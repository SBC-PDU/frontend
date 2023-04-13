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
		<title>{{ $t('core.devices.list.title') }}</title>
	</Head>
	<v-data-table-server
		:headers='headers'
		:items='devices'
		:items-length='devices.length'
		:loading='loading'
	>
		<template #top>
			<v-toolbar color='primary' flat>
				<v-toolbar-title>
					<v-icon>mdi-power</v-icon>
					{{ $t('core.devices.list.title') }}
				</v-toolbar-title>
				<v-toolbar-items>
					<DeviceForm action='add' @save='loadDevices()' />
				</v-toolbar-items>
			</v-toolbar>
		</template>
		<template #item='{item}'>
			<tr>
				<td>
					<router-link :to='"/devices/" + item.raw.id'>
						{{ item.raw.name }}
					</router-link>
				</td>
				<td>
					{{ item.raw.macAddress }}
				</td>
				<td>
					<span v-if='item.raw.lastSeen !== null'>{{ $d(item.raw.lastSeen, 'long') }}</span>
				</td>
				<td>
					{{ item.raw.outputs.length }}
				</td>
				<td class='text-end'>
					<DeviceForm action='editTable' :id='item.raw.id' @save='loadDevices()' />
					<DeviceDeleteConfirmation v-if='userStore.getRole === UserRole.Admin' :device='item.raw' @delete='loadDevices()' />
				</td>
			</tr>
		</template>
	</v-data-table-server>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import {ref} from 'vue';
import {useI18n} from 'vue-i18n';

import DeviceDeleteConfirmation from '@/components/devices/DeviceDeleteConfirmation.vue';
import DeviceForm from '@/components/devices/DeviceForm.vue';
import DeviceService from '@/services/DeviceService';
import {useUserStore} from '@/store/user';
import {Device} from '@/types/device';
import {UserRole} from '@/types/user';

const i18n = useI18n();
const deviceService = new DeviceService();
const userStore = useUserStore();

const headers = [
	{title: i18n.t('core.devices.fields.name'), value: 'name'},
	{title: i18n.t('core.devices.fields.macAddress'), value: 'macAddress'},
	{title: i18n.t('core.devices.fields.lastSeen'), values: 'lastSeen'},
	{title: i18n.t('core.devices.fields.outputs.title'), values: 'outputs'},
	{title: i18n.t('core.tables.actions'), value: 'actions', align: 'end', sortable: false},
];
const loading = ref<boolean>(true);
const devices = ref<Device[]>([]);

loadDevices();

/**
 * Load devices
 */
function loadDevices() {
	loading.value = true;
	deviceService.list().then((response: Device[]) => {
		loading.value = false;
		devices.value = response;
	});
}

</script>

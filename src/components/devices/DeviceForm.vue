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
	<v-dialog
		v-model='dialog'
		persistent
		scrollable
		:width='modalWidth'
	>
		<template #activator='{ props }'>
			<v-btn
				v-if='action === "add"'
				color='green'
				prepend-icon='mdi-plus'
				v-bind='props'
				variant='elevated'
			>
				<span class='d-none d-sm-inline'>
					{{ $t('core.devices.add.activator') }}
				</span>
			</v-btn>
			<v-btn
				v-else-if='action === "edit"'
				color='blue'
				class='float-end'
				prepend-icon='mdi-pencil'
				v-bind='props'
				variant='elevated'
			>
				<span class='d-none d-sm-inline'>
					{{ $t('core.devices.edit.activator') }}
				</span>
			</v-btn>
			<v-icon
				v-else
				v-bind='props'
				color='primary'
				class='me-2'
			>
				mdi-pencil-outline
			</v-icon>
		</template>
		<v-form ref='form' @submit.prevent='submit'>
			<Card :header-color='action === "add" ? "green-darken-1" : "primary"' style='max-height: 90vh'>
				<template #title>
					{{ action === "add" ? $t('core.devices.add.title') : $t('core.devices.edit.title') }}
				</template>
				<v-text-field
					v-model='device.name'
					:label='$t("core.devices.fields.name")'
					:rules='[
						v => FormValidator.isRequired(v, $t("core.devices.form.messages.emptyName")),
					]'
					required
				/>
				<v-text-field
					v-if='action === "add"'
					v-model='device.macAddress'
					:label='$t("core.devices.fields.macAddress")'
					:rules='[
						v => FormValidator.isRequired(v, $t("core.devices.form.messages.emptyMacAddress")),
					]'
					required
				/>
				<h2 class='mb-4'>{{ $t('core.devices.form.outputs.title') }}</h2>
				<v-row v-for='(output, outputIndex) in device.outputs' :key='output.index'>
					<v-col cols='12' sm='4'>
						<v-text-field
							v-model.number='output.index'
							:label='$t("core.devices.fields.outputs.index")'
							:rules='[
								v => FormValidator.isRequired(v, $t("core.devices.form.messages.outputs.emptyIndex")),
							]'
							required
							type='number'
						/>
					</v-col>
					<v-col cols='12' sm='8'>
						<v-text-field
							v-model='output.name'
							:label='$t("core.devices.fields.outputs.name")'
							:rules='[
								v => FormValidator.isRequired(v, $t("core.devices.form.messages.outputs.emptyName")),
							]'
							required
						>
							<template v-slot:append v-if='display.smAndUp.value'>
								<v-btn-group class='my-auto' density='compact'>
									<v-btn
										color='success'
										@click='addOutput()'
										size='small'
									>
										<v-icon>mdi-plus</v-icon>
									</v-btn>
									<v-btn
										color='red'
										@click='device.outputs.splice(outputIndex, 1)'
										:disabled='device.outputs.length === 1'
										size='small'
									>
										<v-icon>mdi-minus</v-icon>
									</v-btn>
								</v-btn-group>
							</template>
						</v-text-field>
						<v-btn-group v-if='display.xs.value' class='my-auto' density='compact'>
							<v-btn
								color='success'
								@click='addOutput()'
								size='small'
							>
								<v-icon>mdi-plus</v-icon>
							</v-btn>
							<v-btn
								color='red'
								@click='removeOutput(outputIndex)'
								:disabled='device.outputs.length === 1'
								size='small'
							>
								<v-icon>mdi-minus</v-icon>
							</v-btn>
						</v-btn-group>
					</v-col>
				</v-row>
				<v-btn
					v-if='device.outputs.length === 0'
					color='success'
					@click='addOutput()'
				>
					<v-icon>mdi-plus</v-icon>
				</v-btn>
				<template #actions>
					<v-btn
						v-if='action === "add"'
						color='success'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.add') }}
					</v-btn>
					<v-btn
						v-else
						color='primary'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.edit') }}
					</v-btn>
					<v-spacer/>
					<v-btn
						color='gray-darken-1'
						@click='close'
					>
						{{ $t('core.actions.cancel') }}
					</v-btn>
				</template>
			</Card>
		</v-form>
	</v-dialog>
</template>

<script lang='ts' setup>
import {Ref, ref, watchEffect} from 'vue';
import {useI18n} from 'vue-i18n';
import {toast} from 'vue3-toastify';
import {useDisplay} from 'vuetify';
import {VForm} from 'vuetify/components';

import Card from '@/components/Card.vue';
import FormValidator from '@/helpers/formValidator';
import ModalWindowHelper from '@/helpers/modalWindowHelper';
import DeviceService from '@/services/DeviceService';
import {
	DeviceAdd,
	DeviceDetail,
	DeviceModify,
	DeviceOutput,
	DeviceOutputWithMeasurements
} from '@/types/device';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';

interface Props {
	/// Action to perform
	action: 'add' | 'edit' | 'editTable';
	/// Device ID to edit
	id?: string;
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new DeviceService();

const emit = defineEmits(['save']);
const props = defineProps<Props>();
const dialog = ref(false);
const display = useDisplay();
const modalWidth = ModalWindowHelper.getWidth();
const form: Ref<typeof VForm | null> = ref(null);

const device: Ref<DeviceAdd|DeviceModify> = ref({
	name: '',
	outputs: [],
});

/**
 * Loads data about the device
 */
function loadData(): void {
	if (props.action === 'add' || props.id === undefined) {
		device.value = {
			name: '',
			macAddress: '',
			outputs: [
				{index: 1, name: ''}
			],
		};
		return;
	}
	service.get(props.id).then((response: DeviceDetail) => {
		device.value = {
			name: response.name,
			outputs: response.outputs.map((output: DeviceOutputWithMeasurements): DeviceOutput => ({
				index: output.index,
				name: output.name,
			})),
		};
	});
}

watchEffect(async () => {
	loadData();
});

/**
 * Closes the dialog
 */
function close(): void {
	dialog.value = false;
}

/**
 * Adds a new output
 */
function addOutput(): void {
	device.value.outputs.push({index: device.value.outputs.length + 1, name: ''});
}

/**
 * Removes an output
 * @param index Index of the output to remove
 */
function removeOutput(index: number): void {
	device.value.outputs.splice(index, 1);
}

/**
 * Adds a new device
 * @param {DeviceAdd} data Device to add
 */
async function add(data: DeviceAdd): Promise<void> {
	await service.add(data)
		.then(() => {
			toast.success(i18n.t('core.devices.add.messages.success', {name: data.name}));
		})
		.catch(() => {
			toast.error(i18n.t('core.devices.add.messages.error', {name: data.name}));
		});
	loadingSpinner.hide();
	emit('save');
}

/**
 * Edits a device
 * @param {string} id Device ID
 * @param {DeviceModify} data Device to edit
 */
async function edit(id: string, data: DeviceModify): Promise<void> {
	await service.edit(id, data)
		.then(() => {
			toast.success(i18n.t('core.devices.edit.messages.success', {name: data.name}));
		})
		.catch(() => {
			toast.error(i18n.t('core.devices.edit.messages.error', {name: data.name}));
		});
	loadingSpinner.hide();
	emit('save');
}

/**
 * Submits the form
 */
async function submit(): Promise<void> {
	if (form.value === null) {
		return;
	}
	const {valid} = await form.value.validate();
	if (!valid) {
		return;
	}
	close();
	loadingSpinner.show();
	if (props.action === 'add') {
		await add(device.value as DeviceAdd);
	} else if (props.id !== undefined) {
		await edit(props.id, device.value as DeviceModify);
	}
}

</script>

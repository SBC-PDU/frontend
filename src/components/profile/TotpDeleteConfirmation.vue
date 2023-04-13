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
			<v-icon
				v-bind='props'
				color='error'
				class='me-2'
			>
				mdi-trash-can
			</v-icon>
		</template>
		<v-form @submit.prevent='deleteToken()' ref='form'>
			<Card header-color='red-darken-1' style='max-height: 90vh'>
				<template #title>
					{{ $t('core.user.totp.delete.title') }}
				</template>
				{{ $t('core.user.totp.delete.message', {name: token.name}) }}
				<TotpField v-model='formData.code'/>
				<PasswordField
					v-model='formData.password'
					:label='$t("core.user.fields.password")'
					:rules='[
						(v: any) => FormValidator.isRequired(v, $t("core.user.messages.emptyPassword")),
					]'
					required
					prepend-inner-icon='mdi-key'
				/>
				<template #actions>
					<v-btn
						color='error'
						variant='text'
						@click='deleteToken()'
					>
						{{ $t('core.user.totp.delete.confirm') }}
					</v-btn>
					<v-spacer/>
					<v-btn
						color='gray darken-1'
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
import {Ref, ref} from 'vue';
import {toast} from 'vue3-toastify';
import {useI18n} from 'vue-i18n';
import {VForm} from 'vuetify/components';

import Card from '@/components/Card.vue';
import PasswordField from '@/components/PasswordField.vue';
import TotpField from '@/components/users/TotpField.vue';
import FormValidator from '@/helpers/formValidator';
import ModalWindowHelper from '@/helpers/modalWindowHelper';
import AccountService from '@/services/AccountService';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {UserTotp, UserTotpRemove} from '@/types/totp';

/**
 * The component props
 */
interface Props {
	/// TOTP token to delete
	token: UserTotp;
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new AccountService();

const emit = defineEmits(['delete']);
const props = defineProps<Props>();
const dialog = ref<boolean>(false);
const modalWidth = ModalWindowHelper.getWidth();
const form: Ref<typeof VForm | null> = ref(null);
const formData = ref<UserTotpRemove>({
	code: '',
	password: '',
});

/**
 * Close the dialog
 */
function close(): void {
	dialog.value = false;
}

/**
 * Delete the TOTP token
 */
async function deleteToken(): Promise<void> {
	if (form.value === null) {
		return;
	}
	const {valid} = await form.value.validate();
	if (!valid) {
		return;
	}
	loadingSpinner.show();
	await service.removeTotp(props.token.uuid, formData.value)
		.then(() => {
			close();
			emit('delete');
			loadingSpinner.hide();
			toast.success(i18n.t('core.user.totp.delete.messages.success', {name: props.token.name}));
		})
		.catch(() => {
			loadingSpinner.hide();
			toast.error(i18n.t('core.user.totp.delete.messages.error', {name: props.token.name}));
		});
}

</script>

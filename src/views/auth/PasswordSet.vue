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
		<title>{{ $t('core.password.set.title') }}</title>
	</Head>
	<Card>
		<template #title>
			{{ $t('core.password.set.title') }}
		</template>
		{{ $t('core.password.set.text') }}
		<v-form @submit.prevent='submit' ref='form'>
			<PasswordField
				v-model='value.password'
				:label='$t("core.user.fields.newPassword")'
				:rules='[
					v => FormValidator.isRequired(v, $t("core.user.messages.emptyNewPassword")),
				]'
				required
				prepend-inner-icon='mdi-key'
			/>
			<v-btn
				color='primary'
				type='submit'
				prepend-icon='mdi-account-key'
			>
				{{ $t('core.password.set.button') }}
			</v-btn>
		</v-form>
	</Card>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import {AxiosError} from 'axios';
import {ref, Ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {toast} from 'vue3-toastify';
import {useRouter} from 'vue-router';
import {VForm} from 'vuetify/components';
import * as uuid from 'uuid';

import Card from '@/components/Card.vue';
import PasswordField from '@/components/PasswordField.vue';
import FormValidator from '@/helpers/formValidator';
import AuthenticationService from '@/services/AuthenticationService';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {useUserStore} from '@/store/user';
import {PasswordSet, SignedInUser} from '@/types/auth';

const props = defineProps({
	uuid: {
		type: String,
		required: true,
		validator(value: string): boolean {
			return uuid.validate(value) && uuid.version(value) === 4;
		},
	},
});

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const router = useRouter();
const service = new AuthenticationService();
const userStore = useUserStore();

const value: Ref<PasswordSet> = ref({
	password: '',
});
const form: Ref<typeof VForm | null> = ref(null);

/**
 * Submit the form
 */
async function submit(): Promise<void> {
	if (form.value === null) {
		return;
	}
	const {valid} = await form.value.validate();
	if (!valid) {
		return;
	}
	loadingSpinner.show();
	await service.passwordSet(props.uuid, value.value)
		.then((response: SignedInUser) => {
			loadingSpinner.hide();
			userStore.setUserInfo(response);
			toast.success(i18n.t('core.password.set.messages.success'));
			router.push('/');
		})
		.catch((error: AxiosError) => {
			loadingSpinner.hide();
			switch (error.response?.status) {
				case 403:
					toast.error(i18n.t('core.password.set.messages.banned'));
					return;
				case 404:
					toast.error(i18n.t('core.password.set.messages.notFound'));
					return;
				case 410:
					toast.error(i18n.t('core.password.set.messages.expired'));
					return;
				default:
					toast.error(i18n.t('core.password.set.messages.error'));
					return;
			}
		});
}

</script>

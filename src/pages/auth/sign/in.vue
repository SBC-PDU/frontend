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
		<title>{{ $t('core.sign.in.title') }}</title>
	</Head>
	<Card>
		<template #title>
			{{ $t('core.sign.in.title') }}
		</template>
		<v-form
			ref='form'
			@submit.prevent='onSubmit'
		>
			<div v-if='state === SignInState.Initial'>
				<v-text-field
					v-model='credentials.email'
					:label='$t("core.user.fields.email")'
					:rules='[
						(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyEmail")),
						(v: string) => FormValidator.isEmail(v, $t("core.user.messages.invalidEmail")),
					]'
					required
					:prepend-inner-icon='mdiEmail'
				/>
				<PasswordField
					v-model='credentials.password'
					:label='$t("core.user.fields.password")'
					:rules='[
						(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyPassword")),
					]'
					required
					:prepend-inner-icon='mdiKey'
				/>
			</div>
			<div v-else-if='state === SignInState.RequiredSecondFactor'>
				<TotpField v-model='credentials.code' />
			</div>
			<v-btn
				color='primary'
				type='submit'
				:prepend-icon='mdiLogin'
			>
				{{ $t('core.sign.in.button') }}
			</v-btn>
		</v-form>
	</Card>
</template>

<route lang='yaml'>
name: SignIn
meta:
  requiresAuth: false
</route>

<script lang='ts' setup>
import {mdiEmail, mdiKey, mdiLogin} from '@mdi/js';
import {Head} from '@unhead/vue/components';
import {type AxiosError} from 'axios';
import {ref, type Ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRoute, useRouter} from 'vue-router';
import {toast} from 'vue3-toastify';
import {VForm} from 'vuetify/components';

import Card from '@/components/Card.vue';
import PasswordField from '@/components/PasswordField.vue';
import TotpField from '@/components/users/TotpField.vue';
import FormValidator from '@/helpers/formValidator';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {useUserStore} from '@/store/user';
import {type Credentials} from '@/types/auth';
import {type ErrorMessage} from '@/types/error';

/**
 * Sign in state
 */
enum SignInState {
  /// Initial state
  Initial,
  /// 2FA is required
  RequiredSecondFactor,
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const credentials: Ref<Credentials> = ref({
	email: '',
	password: '',
	code: '',
});
const form: Ref<typeof VForm | null> = ref(null);
const state: Ref<SignInState> = ref(SignInState.Initial);

/**
 * Submit the form
 */
async function onSubmit(): Promise<void> {
	if (form.value === null) {
		return;
	}
	const {valid} = await form.value.validate();
	if (!valid) {
		return;
	}
	loadingSpinner.show();
	await userStore.signIn(credentials.value)
		.then(() => {
			let destination = (route?.query?.redirect as string | undefined) ?? '/';
			if (destination.startsWith('/auth/sign/in')) {
				destination = '/';
			}
			router.push(destination);
			loadingSpinner.hide();
			toast.success(i18n.t('core.sign.in.messages.success').toString());
		})
		.catch((error: AxiosError) => {
			loadingSpinner.hide();
			if (error.response?.status === 400) {
				const message: ErrorMessage = error.response.data as ErrorMessage;
				if (message.message === 'Invalid credentials') {
					toast.error(i18n.t('core.sign.in.messages.invalidCredentials').toString());
					return;
				}
				if (message.message === 'Incorrect 2FA code') {
					toast.error(i18n.t('core.user.totp.messages.incorrectCode').toString());
					return;
				}
				if (message.message === '2FA code is required') {
					state.value = SignInState.RequiredSecondFactor;
					return;
				}
				return;
			} else if (error.response?.status === 403) {
				toast.error(i18n.t('core.sign.in.messages.accountBlocked').toString());
				return;
			}
			toast.error(i18n.t('core.sign.in.messages.error').toString());
		});
}

</script>

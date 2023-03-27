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
	<v-card>
		<v-card-title class='bg-primary mb-4'>
			{{ $t('core.sign.in.title') }}
		</v-card-title>
		<v-card-text>
			<v-form ref='form' @submit.prevent='onSubmit'>
				<v-text-field
					v-model='credentials.email'
					:label='$t("core.user.fields.email")'
					:rules='[
						(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyEmail")),
						(v: string) => FormValidator.isEmail(v, $t("core.user.messages.invalidEmail")),
					]'
					required
				/>
				<PasswordField
					v-model='credentials.password'
					:label='$t("core.user.fields.password")'
					:rules='[
						(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyPassword")),
					]'
					required
				/>
				<v-btn
					color='primary'
					type='submit'
				>
					{{ $t('core.sign.in.button') }}
				</v-btn>
			</v-form>
		</v-card-text>
	</v-card>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import {AxiosError} from 'axios';
import {ref, Ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRoute, useRouter} from 'vue-router';
import {toast} from 'vue3-toastify';
import {VForm} from 'vuetify/components';

import PasswordField from '@/components/PasswordField.vue';
import FormValidator from '@/helpers/formValidator';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {useUserStore} from '@/store/user';
import {Credentials} from '@/types/auth';

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const credentials: Ref<Credentials> = ref({
	email: '',
	password: '',
});
const form: Ref<typeof VForm | null> = ref(null);

/**
 * Submit the form
 */
async function onSubmit(): Promise<void> {
	loadingSpinner.show();
	const {valid} = await form.value!.validate();
	if (!valid) {
		return;
	}
	await userStore.signIn(credentials.value).then(() => {
		let destination = (route?.query?.redirect as string | undefined) ?? '/';
		if (destination.startsWith('/auth/sign/in')) {
			destination = '/';
		}
		router.push(destination);
		loadingSpinner.hide();
		toast.success(i18n.t('core.sign.in.messages.success').toString());
	}).catch((error: AxiosError) => {
		loadingSpinner.hide();
		if (error.response?.status === 400) {
			toast.error(i18n.t('core.sign.in.messages.invalidCredentials').toString());
			return;
		} else if (error.response?.status === 403) {
			toast.error(i18n.t('core.sign.in.messages.accountBlocked').toString());
			return;
		}
		toast.error(i18n.t('core.sign.in.messages.error').toString());
	});
}

</script>

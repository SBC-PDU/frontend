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
		<title>{{ $t('core.password.recovery.title') }}</title>
	</Head>
	<v-card>
		<v-card-title class='bg-primary'>
			{{ $t('core.password.recovery.title') }}
		</v-card-title>
		<v-card-text>
			<p class='my-4'>{{ $t('core.password.recovery.text') }}</p>
			<v-form @submit.prevent='submit' ref='form'>
				<v-text-field
					v-model='recovery.email'
					:label='$t("core.user.fields.email")'
					:rules='[
						v => FormValidator.isRequired(v, $t("core.user.messages.emptyEmail")),
						v => FormValidator.isEmail(v, $t("core.user.messages.invalidEmail")),
					]'
					required
				/>
				<v-btn
					color='primary'
					type='submit'
				>
					{{ $t('core.password.recovery.button') }}
				</v-btn>
			</v-form>
		</v-card-text>
	</v-card>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import {ref, Ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {toast} from 'vue3-toastify';
import {useRouter} from 'vue-router';
import {VForm} from 'vuetify/components';

import FormValidator from '@/helpers/formValidator';
import AuthenticationService from '@/services/AuthenticationService';
import {PasswordRecovery} from '@/types/auth';

const i18n = useI18n();
const router = useRouter();
const service = new AuthenticationService();
const recovery: Ref<PasswordRecovery> = ref({
	email: '',
});
const form: Ref<typeof VForm | null> = ref(null);

/**
 * Submit the form
 */
async function submit(): Promise<void> {
	const {valid} = await form.value!.validate();
	if (!valid) {
		return;
	}
	service.passwordRecovery(recovery.value)
		.then(() => {
			router.push({name: 'SignIn'});
			toast.success(i18n.t('core.password.recovery.messages.success'));
		})
		.catch(() => {
			toast.error(i18n.t('core.password.recovery.messages.error'));
		});
}
</script>

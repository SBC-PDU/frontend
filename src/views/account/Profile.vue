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
		<title>{{ $t('core.profile.title') }}</title>
	</Head>
	<Card>
		<template #title>
			{{ $t('core.profile.title') }}
		</template>
		<v-form ref='form' class='mt-4' @submit.prevent='onSubmit'>
			<v-text-field
				v-model='user.name'
				:label='$t("core.user.fields.name")'
				:rules='[
					v => FormValidator.isRequired(v, $t("core.user.messages.emptyName")),
				]'
				required
				prepend-inner-icon='mdi-account'
			/>
			<v-text-field
				v-model='user.email'
				:label='$t("core.user.fields.email")'
				:rules='[
					v => FormValidator.isRequired(v, $t("core.user.messages.emptyEmail")),
					v => FormValidator.isEmail(v, $t("core.user.messages.invalidEmail")),
				]'
				required
				prepend-inner-icon='mdi-email'
			/>
			<v-select
				v-model='user.language'
				:items='[
					{title: $t("core.locales.en"), value: UserLanguage.English},
					{title: $t("core.locales.cs"), value: UserLanguage.Czech},
				]'
				:label='$t("core.user.fields.language")'
				:rules='[
					v => FormValidator.isRequired(v, $t("core.user.messages.emptyLanguage")),
				]'
				required
				prepend-inner-icon='mdi-translate'
			/>
			<v-switch
				v-model='user.changePassword'
				:label='$t("core.profile.fields.passwordChange")'
				color='primary'
				prepend-icon='mdi-key-change'
			/>
			<PasswordField
				v-if='user.changePassword'
				v-model='user.oldPassword'
				:label='$t("core.user.fields.oldPassword")'
				:rules='[
					(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyOldPassword")),
				]'
				required
				prepend-inner-icon='mdi-key'
			/>
			<PasswordField
				v-if='user.changePassword'
				v-model='user.newPassword'
				:label='$t("core.user.fields.newPassword")'
				:rules='[
					(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyNewPassword")),
				]'
				required
				prepend-inner-icon='mdi-key'
			/>
			<v-btn
				color='primary'
				type='submit'
				prepend-icon='mdi-content-save'
			>
				{{ $t('core.actions.edit') }}
			</v-btn>
		</v-form>
	</Card>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import {AxiosError} from 'axios';
import {useI18n} from 'vue-i18n';
import {ref, Ref} from 'vue';
import {toast} from 'vue3-toastify';
import {VForm} from 'vuetify/components';

import Card from '@/components/Card.vue';
import PasswordField from '@/components/PasswordField.vue';
import FormValidator from '@/helpers/formValidator';
import AccountService from '@/services/AccountService';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {useLocaleStore} from '@/store/locale';
import {useUserStore} from '@/store/user';
import {AccountModify} from '@/types/account';
import {SignedInUser} from '@/types/auth';
import {UserInfo, UserLanguage} from '@/types/user';

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const localeStore = useLocaleStore();
const userStore = useUserStore();
const service = new AccountService();
const form: Ref<typeof VForm | null> = ref(null);
const user: Ref<AccountModify> = ref<AccountModify>({
	name: '',
	email: '',
	language: UserLanguage.English,
	changePassword: false,
	oldPassword: null,
	newPassword: null,
});

/**
 * Loads data from backend
 */
function loadData(): void {
	loadingSpinner.show();
	service.get().then((info: UserInfo) => {
		user.value = {
			name: info.name,
			email: info.email,
			language: info.language,
			changePassword: false,
			oldPassword: null,
			newPassword: null,
		};
		loadingSpinner.hide();
	});
}

loadData();

/**
 * Submit form
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
	service.edit(user.value).then((response: SignedInUser) => {
		userStore.setUserInfo(response);
		localeStore.setLocale(user.value.language);
		loadData();
		loadingSpinner.hide();
		toast.success(i18n.t('core.profile.messages.success').toString());
	}).catch((error: AxiosError) => {
		loadingSpinner.hide();
		if (error.response?.status === 400) {
			const errorResponse: Error = error.response.data as Error;
			if (errorResponse.message === 'Incorrect current password.') {
				toast.error(i18n.t('core.profile.messages.incorrectCurrentPassword').toString());
				return;
			}
		}
		toast.error(i18n.t('core.profile.messages.error').toString());
	});
}
</script>

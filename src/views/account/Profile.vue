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
	<v-card id='info' class='mb-4'>
		<v-card-title class='bg-primary'>
			{{ $t('core.profile.title') }}
		</v-card-title>
		<v-card-text class='mt-4'>
			<v-form ref='form' @submit.prevent='onSubmit'>
				<v-text-field
					v-model='user.name'
					:label='$t("core.user.fields.name")'
					:rules='[
						v => FormValidator.isRequired(v, $t("core.user.messages.emptyName")),
					]'
					required
				/>
				<v-text-field
					v-model='user.email'
					:label='$t("core.user.fields.email")'
					:rules='[
						v => FormValidator.isRequired(v, $t("core.user.messages.emptyEmail")),
						v => FormValidator.isEmail(v, $t("core.user.messages.invalidEmail")),
					]'
					required
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
				/>
				<v-switch
					v-model='user.changePassword'
					:label='$t("core.profile.fields.passwordChange")'
					color='primary'
				/>
				<PasswordField
					v-if='user.changePassword'
					v-model='user.oldPassword'
					:label='$t("core.profile.fields.oldPassword")'
					:rules='[
						(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyPassword")),
					]'
					required
				/>
				<PasswordField
					v-if='user.changePassword'
					v-model='user.newPassword'
					:label='$t("core.profile.fields.newPassword")'
					:rules='[
						(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyPassword")),
					]'
					required
				/>
				<v-btn
					color='primary'
					type='submit'
				>
					{{ $t('core.actions.edit') }}
				</v-btn>
			</v-form>
		</v-card-text>
	</v-card>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import {useI18n} from 'vue-i18n';
import {ref, Ref} from 'vue';
import {toast} from 'vue3-toastify';
import {VForm} from 'vuetify/components';

import PasswordField from '@/components/PasswordField.vue';
import FormValidator from '@/helpers/formValidator';
import AccountService from '@/services/AccountService';
import {AccountModify} from '@/types/account';
import {UserInfo, UserLanguage} from '@/types/user';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {useLocaleStore} from '@/store/locale';

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const localeStore = useLocaleStore();
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
	const {valid} = await form.value!.validate();
	if (!valid) {
		return;
	}
	loadingSpinner.show();
	service.edit(user.value).then(() => {
		localeStore.setLocale(user.value.language);
		loadData();
		loadingSpinner.hide();
		toast.success(i18n.t('core.profile.messages.success').toString());
	}).catch(() => {
		loadingSpinner.hide();
		toast.error(i18n.t('core.profile.messages.error').toString());
	});
}
</script>

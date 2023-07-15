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
		<title>{{ $t('admin.users.list.title') }}</title>
	</Head>
	<v-data-table
		:headers='headers'
		:items='users'
		:items-length='users.length'
		:loading='loading'
	>
		<template #top>
			<v-toolbar color='primary' flat>
				<v-toolbar-title>
					<v-icon>mdi-account-group</v-icon>
					{{ $t('admin.users.list.title') }}
				</v-toolbar-title>
				<v-toolbar-items>
					<UserForm action='invite' @reload='loadUsers'/>
					<UserForm action='add' @reload='loadUsers'/>
				</v-toolbar-items>
			</v-toolbar>
		</template>
		<template #item.avatar='{ item }'>
			<v-avatar :image='getGravatarUrl(item.raw.email)' class='ma-auto' size='32'/>
		</template>
		<template #item.email='{ item }'>
			<a :href='"mailto:\"" + item.raw.name + "<" + item.raw.email + ">\""'>
				{{ item.raw.email }}
			</a>
		</template>
		<template #item.role='{ item }'>
			<UserRoleBadge :role='item.raw.role' />
		</template>
		<template #item.language='{ item }'>
			{{ getLanguageFlag(item.raw.language) }}
			<span class='d-none d-xl-inline'>
				{{ $t(`core.locales.${item.raw.language}`) }}
			</span>
		</template>
		<template #item.state='{ item }'>
			<AccountStateBadge :state='item.raw.state' />
		</template>
		<template #item.actions='{ item }'>
			<v-btn-group density='compact'>
				<ResendEmailButton :user='item.raw' @change='loadUsers' />
				<AccountStateButton v-if='userId !== item.raw.id' :user='item.raw' @change='loadUsers' />
				<UserForm :init-user='toRaw(item.raw)' action='edit' @reload='loadUsers' />
				<UserDeleteConfirmation :user='item.raw' @submit='loadUsers' />
			</v-btn-group>
		</template>
	</v-data-table>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import md5 from 'md5';
import {storeToRefs} from 'pinia';
import {Ref, ref, toRaw} from 'vue';
import {useI18n} from 'vue-i18n';

import AccountStateButton from '@/components/admin/user/AccountStateButton.vue';
import ResendEmailButton from '@/components/admin/user/ResendEmailButton.vue';
import UserDeleteConfirmation from '@/components/admin/user/UserDeleteConfirmation.vue';
import UserForm from '@/components/admin/user/UserForm.vue';
import UserService from '@/services/UserService';
import {useUserStore} from '@/store/user';
import {UserInfo, UserLanguage} from '@/types/user';
import AccountStateBadge from '@/components/admin/user/AccountStateBadge.vue';
import UserRoleBadge from '@/components/admin/user/UserRoleBadge.vue';

const i18n = useI18n();
const userService = new UserService();
const userStore = useUserStore();
const {getId: userId} = storeToRefs(userStore);

const headers = [
	{title: i18n.t('core.user.fields.avatar'), key: 'avatar'},
	{title: i18n.t('core.user.fields.name'), key: 'name'},
	{title: i18n.t('core.user.fields.email'), key: 'email'},
	{title: i18n.t('core.user.fields.role'), key: 'role'},
	{title: i18n.t('core.user.fields.language'), key: 'language'},
	{title: i18n.t('core.user.fields.state'), key: 'state'},
	{title: i18n.t('core.tables.actions'), key: 'actions', align: 'end', sortable: false},
];
let loading = ref(true);
let users: Ref<UserInfo[]> = ref([]);

/**
 * Returns Gravatar URL for the given email
 * @param {string} email User email
 * @returns {string} Gravatar URL
 */
function getGravatarUrl(email: string): string {
	const hash = md5(email.trim().toLowerCase());
	return `https://www.gravatar.com/avatar/${hash}?s=200&d=mp`;
}

/**
 * Returns language flag
 * @param {UserLanguage} language Language
 * @return {string} Unicode flag symbol
 */
function getLanguageFlag(language: UserLanguage): string {
	switch (language) {
		case UserLanguage.Czech:
			return '🇨🇿';
		case UserLanguage.English:
			return '🇬🇧';
	}
}

loadUsers();

/**
 * Loads all users
 */
function loadUsers() {
	loading.value = true;
	userService.list().then((response: UserInfo[]) => {
		users.value = response;
		loading.value = false;
	});
}

</script>

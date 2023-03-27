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
	<v-data-table-server
		:headers='headers'
		:items='users'
		:items-length='users.length'
		:loading='loading'
	>
		<template #top>
			<v-toolbar color='primary' flat>
				<v-toolbar-title>
					{{ $t('admin.users.list.title') }}
				</v-toolbar-title>
				<v-spacer/>
				<UserForm action='add' @reload='loadUsers'/>
			</v-toolbar>
		</template>
		<template #item='{ item }'>
			<tr>
				<td>
					<v-avatar :image='getGravatarUrl(item.raw.email)' class='ma-auto' size='32'/>
				</td>
				<td>{{ item.raw.name }}</td>
				<td>
					<a :href='"mailto:\"" + item.raw.name + "<" + item.raw.email + ">\""'>
						{{ item.raw.email }}
					</a>
				</td>
				<td>
					<v-chip :color='getRoleColor(item.raw.role)'>
						{{ $t(`core.user.roles.${item.raw.role}`) }}
					</v-chip>
				</td>
				<td>
					{{ getLanguageFlag(item.raw.language) }}
					<span class='d-none d-xl-inline'>
						{{ $t(`core.locales.${item.raw.language}`) }}
					</span>
				</td>
				<td>
					<v-chip :color='getStateColor(item.raw.state)' :prepend-icon='getStateIcon(item.raw.state)'>
						<span class='d-none d-xl-inline'>
							{{ $t(`core.user.states.${item.raw.state}`) }}
						</span>
					</v-chip>
				</td>
				<td style='text-align: right;'>
					<v-btn-group density='compact'>
						<AccountStateButton v-if='userId !== item.raw.id' :user='item.raw' @change='loadUsers' />
						<UserForm :init-user='toRaw(item.raw)' action='edit' @reload='loadUsers' />
						<UserDeleteConfirmation :user='item.raw' @submit='loadUsers' />
					</v-btn-group>
				</td>
			</tr>
		</template>
	</v-data-table-server>
</template>

<script lang='ts' setup>
import {Head} from '@vueuse/head';
import md5 from 'md5';
import {storeToRefs} from 'pinia';
import {Ref, ref, toRaw} from 'vue';
import {useI18n} from 'vue-i18n';

import AccountStateButton from '@/components/admin/AccountStateButton.vue';
import UserDeleteConfirmation from '@/components/admin/UserDeleteConfirmation.vue';
import UserForm from '@/components/admin/UserForm.vue';
import UserService from '@/services/UserService';
import {useUserStore} from '@/store/user';
import {AccountState, UserInfo, UserLanguage, UserRole} from '@/types/user';

const i18n = useI18n();
const userService = new UserService();
const userStore = useUserStore();
const {getId: userId} = storeToRefs(userStore);

const headers = [
	{title: i18n.t('core.user.fields.avatar'), value: 'avatar'},
	{title: i18n.t('core.user.fields.name'), value: 'name'},
	{title: i18n.t('core.user.fields.email'), value: 'email'},
	{title: i18n.t('core.user.fields.role'), value: 'role'},
	{title: i18n.t('core.user.fields.language'), value: 'language'},
	{title: i18n.t('core.user.fields.state'), value: 'state'},
	{title: i18n.t('core.tables.actions'), value: 'actions', align: 'end', sortable: false},
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

/**
 * Returns the color for the given role
 * @param {UserRole} role The role to get the color for
 * @returns {string} The color
 */
function getRoleColor(role: UserRole): string {
	switch (role) {
		case UserRole.Admin:
			return 'green';
		case UserRole.Normal:
			return 'secondary';
	}
}

/**
 * Returns the color for the given state
 * @param {AccountState} state The state to get the color for
 * @returns {string} The color
 */
function getStateColor(state: AccountState): string {
	switch (state) {
		case AccountState.Verified:
			return 'green';
		case AccountState.Unverified:
			return 'orange';
		case AccountState.Blocked:
			return 'red';
	}
}

/**
 * Returns the icon for the given state
 * @param {AccountState} state The state to get the icon for
 * @returns {string} The icon
 */
function getStateIcon(state: AccountState): string {
	switch (state) {
		case AccountState.Verified:
			return 'mdi-check';
		case AccountState.Unverified:
			return 'mdi-help';
		case AccountState.Blocked:
			return 'mdi-lock';
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

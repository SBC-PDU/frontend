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
	<v-data-table
		:headers='headers'
		:items='data'
		:items-length='data.length'
		:loading='loading'
	>
		<template #top>
			<v-toolbar color='grey' flat>
				<v-toolbar-title>
					<v-icon>mdi-two-factor-authentication</v-icon>
					{{ $t('core.user.totp.title') }}
				</v-toolbar-title>
				<v-toolbar-items>
					<TotpAdd @submit='loadData()' />
				</v-toolbar-items>
			</v-toolbar>
		</template>
		<template #item.createdAt='{ item }'>
			{{ $d(item.raw.createdAt, 'normal') }}
		</template>
		<template #item.actions='{ item }'>
			<v-btn-group density='compact'>
				<TotpDeleteConfirmation :token='item.raw' @delete='loadData()' />
			</v-btn-group>
		</template>
	</v-data-table>
</template>

<script lang='ts' setup>
import {ref} from 'vue';
import {useI18n} from 'vue-i18n';

import TotpAdd from '@/components/profile/TotpAdd.vue';
import TotpDeleteConfirmation from '@/components/profile/TotpDeleteConfirmation.vue';
import AccountService from '@/services/AccountService';
import {UserTotp} from '@/types/totp';

const i18n = useI18n();
const accountService = new AccountService();

const headers = [
	{title: i18n.t('core.user.totp.fields.name'), key: 'name'},
	{title: i18n.t('core.user.totp.fields.createdAt'), key: 'createdAt'},
	{title: i18n.t('core.tables.actions'), key: 'actions', align: 'end', sortable: false},
];
let loading = ref(true);
let data = ref<UserTotp[]>([]);

loadData();

/**
 * Loads all users
 */
function loadData() {
	loading.value = true;
	accountService.listTotp().then((response: UserTotp[]) => {
		data.value = response;
		loading.value = false;
	});
}

</script>

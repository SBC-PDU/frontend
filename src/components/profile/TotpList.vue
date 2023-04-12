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
	<v-data-table-server
		:headers='headers'
		:items='data'
		:items-length='data.length'
		:loading='loading'
	>
		<template #top>
			<v-toolbar color='grey' flat>
				<v-toolbar-title>
					{{ $t('core.user.totp.title') }}
				</v-toolbar-title>
				<v-spacer/>
				<TotpAdd @submit='loadData()'/>
			</v-toolbar>
		</template>
		<template #item='{ item }'>
			<tr>
				<td>{{ item.raw.name }}</td>
				<td>{{ $d(item.raw.createdAt, 'normal') }}</td>
				<td style='text-align: right;'>
					<v-btn-group density='compact'>
						<TotpDeleteConfirmation :token='item.raw' @delete='loadData()' />
					</v-btn-group>
				</td>
			</tr>
		</template>
	</v-data-table-server>
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
	{title: i18n.t('core.user.totp.fields.name'), value: 'name'},
	{title: i18n.t('core.user.totp.fields.createdAt'), value: 'createdAt'},
	{title: i18n.t('core.tables.actions'), value: 'actions', align: 'end', sortable: false},
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

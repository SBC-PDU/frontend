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
	<v-menu>
		<template v-slot:activator='{ props }'>
			<v-btn
				color='blue-lighten-1'
				v-bind='props'
				variant='elevated'
			>
				<v-avatar :image='store.getGravatarUrl ?? undefined' class='mr-2' size='32'/>
				<span class='d-none d-md-inline'>{{ store.getName }}</span>
				<v-icon color='white'>mdi-chevron-down</v-icon>
			</v-btn>
		</template>
		<v-list density='compact'>
			<v-list-item prepend-icon='mdi-logout' @click='signOut()'>
				<v-list-item-title>{{ $t('core.sign.out.title') }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script lang='ts' setup>
import {useUserStore} from '@/store/user';
import {toast} from 'vue3-toastify';
import {useI18n} from 'vue-i18n';

const i18n = useI18n();
const store = useUserStore();

/**
 * Sign out
 */
function signOut() {
	store.signOut();
	toast.success(i18n.t('core.sign.out.message'));
}


</script>

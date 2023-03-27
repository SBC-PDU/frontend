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
	<v-app>
		<v-app-bar color='primary'>
			<v-app-bar-nav-icon @click='sidebarStore.toggleVisibility()' />
			<v-toolbar-title>
				{{ $t('core.title') }}
			</v-toolbar-title>
			<v-spacer/>
			<LocaleSwitcher/>
			<ProfileDropdown v-if='userStore.isLoggedIn'/>
		</v-app-bar>
		<TheSidebar/>
		<v-main style='background-color: #f5f5f5'>
			<v-container>
				<div v-if='userStore.isLoggedIn'>
					<v-alert
						v-if='userStore.getState === AccountState.Unverified'
						class='mb-4'
						type='warning'
						variant='tonal'
					>
						<div class='d-inline-block'>
							{{ $t('core.user.verification.resend.text') }}
						</div>
						<v-btn
							@click='resendVerificationEmail()'
							color='warning'
							class='float-right'
							dense
							prepend-icon='mdi-email-fast'
							size='small'
						>
							{{ $t('core.user.verification.resend.button') }}
						</v-btn>
					</v-alert>
				</div>
				<router-view/>
			</v-container>
		</v-main>
		<v-footer
			:absolute='false'
			app
			color='primary'
		>
			<span class='mr-auto ml-auto'>
				&copy; 2022-{{ currentYear }}
				<a class='text-white' href='https://www.romanondracek.cz/'>
					Roman Ondráček
				</a>
			</span>
		</v-footer>
	</v-app>
</template>

<script lang='ts' setup>
import {useI18n} from 'vue-i18n';
import {toast} from 'vue3-toastify';

import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import ProfileDropdown from '@/components/ProfileDropdown.vue';
import TheSidebar from '@/components/TheSidebar.vue';
import AccountService from '@/services/AccountService';
import {useSidebarStore} from '@/store/sidebar';
import {useUserStore} from '@/store/user';
import {AccountState} from '@/types/user';

const accountService = new AccountService();
const i18n = useI18n();
const sidebarStore = useSidebarStore();
const userStore = useUserStore();
const currentYear = new Date().getFullYear();

/**
 * Resend verification email
 */
function resendVerificationEmail(): void {
	accountService.resendVerificationEmail().then(() => {
		toast.success(i18n.t('core.user.verification.resend.messages.success').toString());
	}).catch(() => {
		toast.error(i18n.t('core.user.verification.resend.messages.error').toString());
	});
}
</script>

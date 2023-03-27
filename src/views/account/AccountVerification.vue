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
		<title>{{ $t('core.account.verification.title') }}</title>
	</Head>
	<v-card>
		<v-card-title class='bg-primary mb-4'>
			{{ $t('core.account.verification.title') }}
		</v-card-title>
		<v-card-text>
			<vue-countdown
				v-if='success'
				:auto-start='true'
				:time='10_000'
				v-slot='{ seconds }'
				@end='redirect'
			>
				{{ $t('core.account.verification.redirect', {countdown: seconds}) }}
			</vue-countdown>
		</v-card-text>
	</v-card>
</template>

<script lang='ts' setup>
import VueCountdown from '@chenfengyuan/vue-countdown';
import {Head} from '@vueuse/head';
import {AxiosError} from 'axios';
import {Ref, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRouter} from 'vue-router';
import {toast} from 'vue3-toastify';

import AccountService from '@/services/AccountService';
import {useUserStore} from '@/store/user';
import {SignInResponse} from '@/types/auth';

interface Props {
	/// Verification UUID
	uuid: string;
}

const i18n = useI18n();
const router = useRouter();
const service = new AccountService();
const store = useUserStore();

const error: Ref<string|null> = ref(null);
const success: Ref<boolean> = ref(false);
const props = defineProps<Props>();

function redirect(): void {
	router.push('/');
}

function verify(): void {
	service.verify(props.uuid).then((response: SignInResponse): void => {
		success.value = true;
		store.setUserInfo(response);
		toast.success(i18n.t('core.account.verification.messages.success').toString());
	}).catch((error: AxiosError) => {
		switch (error.response?.status) {
			case 400:
				toast.error(i18n.t('core.account.verification.messages.alreadyVerified').toString());
				break;
			case 403:
				toast.error(i18n.t('core.account.verification.messages.banned').toString());
				break;
			case 404:
				toast.error(i18n.t('core.account.verification.messages.notFound').toString());
				break;
			case 410:
				toast.error(i18n.t('core.account.verification.messages.expired').toString());
				break;
			default:
				toast.error(i18n.t('core.account.verification.messages.error').toString());
				break;

		}
	});
}

verify();
</script>

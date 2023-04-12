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
	<v-dialog
		v-model='dialog'
		persistent
		scrollable
		:width='modalWidth'
	>
		<template #activator='{ props }'>
			<v-btn
				v-if='action === Action.Add'
				v-bind='props'
				color='green'
				prepend-icon='mdi-plus'
				variant='elevated'
			>
				{{ $t('admin.users.add.activator') }}
			</v-btn>
			<v-btn
				v-else-if='action === Action.Invite'
				v-bind='props'
				color='info'
				prepend-icon='mdi-send'
				variant='elevated'
			>
				{{ $t('admin.users.invite.activator') }}
			</v-btn>
			<v-icon
				v-else
				v-bind='props'
				color='primary'
				class='me-2'
			>
				mdi-pencil
			</v-icon>
		</template>
		<v-form ref='form' @submit.prevent='submit'>
			<Card :header-color='action === Action.Add ? "green-darken-1" : "primary"' style='max-height: 90vh'>
				<template #title>
					<span v-if='action === Action.Add'>{{ $t('admin.users.add.title') }}</span>
					<span v-if='action === Action.Edit'>{{ $t('admin.users.edit.title') }}</span>
					<span v-if='action === Action.Invite'>{{ $t('admin.users.invite.title') }}</span>
				</template>
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
				<PasswordField
					v-if='action === Action.Add'
					v-model='user.password'
					:label='$t("core.user.fields.password")'
					:rules='[
						(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyPassword")),
					]'
					required
				/>
				<v-select
					v-model='user.role'
					:items='[
						{title: $t("core.user.roles.admin"), value: UserRole.Admin},
						{title: $t("core.user.roles.normal"), value: UserRole.Normal},
					]'
					:label='$t("core.user.fields.role")'
					:rules='[
						v => FormValidator.isRequired(v, $t("core.user.messages.emptyRole")),
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
				<template #actions>
					<v-btn
						v-if='action === Action.Add'
						color='success'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.add') }}
					</v-btn>
					<v-btn
						v-if='action === Action.Edit'
						color='primary'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.edit') }}
					</v-btn>
					<v-btn
						v-if='action === Action.Invite'
						color='primary'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.invite') }}
					</v-btn>
					<v-spacer/>
					<v-btn
						color='gray-darken-1'
						@click='close'
					>
						{{ $t('core.actions.cancel') }}
					</v-btn>
				</template>
			</Card>
		</v-form>
	</v-dialog>
</template>

<script lang='ts' setup>
import {Ref, ref, watchEffect} from 'vue';
import {toast} from 'vue3-toastify';
import {useI18n} from 'vue-i18n';
import {VForm} from 'vuetify/components';

import PasswordField from '@/components/PasswordField.vue';
import FormValidator from '@/helpers/formValidator';
import ModalWindowHelper from '@/helpers/modalWindowHelper';
import {UserAdd, UserInfo, UserLanguage, UserModify, UserRole} from '@/types/user';
import UserService from '@/services/UserService';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import Card from '@/components/Card.vue';

/**
 * Actions to perform
 */
enum Action {
	Add = 'add',
	Edit = 'edit',
	Invite = 'invite',
}

/**
 * Props
 */
interface Props {
	/// Action to perform
	action: Action;
	/// User to edit
	initUser?: UserInfo;
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new UserService();

const emit = defineEmits(['reload']);
const props = defineProps<Props>();
const dialog = ref(false);
const form: Ref<typeof VForm | null> = ref(null);
const defaultUser: UserModify = {
	name: '',
	email: '',
	role: UserRole.Normal,
	language: UserLanguage.English,
};
const modalWidth = ModalWindowHelper.getWidth();
const user: Ref<UserModify | UserAdd> = ref<UserModify>(defaultUser);

watchEffect(async (): Promise<void> => {
	switch (props.action) {
		case Action.Add:
			user.value = {...defaultUser, password: ''} as UserAdd;
			break;
		case Action.Edit:
			if (props.initUser) {
				user.value = {
					name: props.initUser.name,
					email: props.initUser.email,
					role: props.initUser.role,
					language: props.initUser.language,
				};
			} else {
				user.value = {...defaultUser};
			}
			break;
		case Action.Invite:
			user.value = {...defaultUser};
			break;
	}
});

/**
 * Closes the dialog
 */
function close(): void {
	dialog.value = false;
}

/**
 * Submits the form
 */
async function submit(): Promise<void> {
	if (form.value === null) {
		return;
	}
	const {valid} = await form.value.validate();
	if (!valid) {
		return;
	}
	loadingSpinner.show();
	switch (props.action) {
		case Action.Add:
			await add();
			break;
		case Action.Invite:
			await invite();
			break;
		case Action.Edit:
			await edit();
			break;
	}
	emit('reload');
}

/**
 * Creates a new user
 */
async function add(): Promise<void> {
	const translationParams = {
		name: user.value.name,
		email: user.value.email,
	};
	await service.create(user.value as UserAdd).then(() => {
		loadingSpinner.hide();
		close();
		toast.success(i18n.t('admin.users.add.messages.success', translationParams));
	}).catch(() => {
		loadingSpinner.hide();
		toast.error(i18n.t('admin.users.add.messages.error', translationParams));
	});
}

/**
 * Invites the user
 */
async function invite(): Promise<void> {
	const translationParams = {
		name: user.value.name,
		email: user.value.email,
	};
	await service.create(user.value).then(() => {
		loadingSpinner.hide();
		close();
		toast.success(i18n.t('admin.users.invite.messages.success', translationParams));
	}).catch(() => {
		loadingSpinner.hide();
		toast.error(i18n.t('admin.users.invite.messages.error', translationParams));
	});
}

/**
 * Edits the user
 */
async function edit(): Promise<void> {
	const translationParams = {
		name: user.value.name,
		email: user.value.email,
	};
	if (props.initUser?.id === undefined) {
		return;
	}
	return await service.edit(props.initUser.id, user.value).then(() => {
		loadingSpinner.hide();
		close();
		toast.success(i18n.t('admin.users.edit.messages.success', translationParams));
	}).catch(() => {
		loadingSpinner.hide();
		toast.error(i18n.t('admin.users.edit.messages.error', translationParams));
	});
}

</script>

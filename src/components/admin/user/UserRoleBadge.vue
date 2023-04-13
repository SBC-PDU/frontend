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
	<v-chip :color='getColor(role)' :prepend-icon='display.mdAndUp.value ? getIcon(role) : undefined'>
		<span v-if='display.mdAndUp.value'>
			{{ $t(`core.user.roles.${role}`) }}
		</span>
		<v-tooltip v-else location='start'>
			<template #activator='{ props }'>
				<v-icon v-bind='props'>
					{{ getIcon(role) }}
				</v-icon>
			</template>
			{{ $t(`core.user.roles.${role}`) }}
		</v-tooltip>
	</v-chip>
</template>

<script lang='ts' setup>
import {useDisplay} from 'vuetify';

import {UserRole} from '@/types/user';

interface Props {
  /// User role
  role: UserRole;
}

const display = useDisplay();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<Props>();

/**
 * Returns the color for the given role
 * @param {UserRole} role The role to get the color for
 * @returns {string} The color
 */
function getColor(role: UserRole): string {
	switch (role) {
		case UserRole.Admin:
			return 'green';
		case UserRole.Normal:
			return 'secondary';
	}
}

/**
 * Returns the icon for the given role
 * @param {UserRole} role The role to get the icon for
 * @returns {string} The icon
 */
function getIcon(role: UserRole): string {
	switch (role) {
		case UserRole.Admin:
			return 'mdi-shield-account';
		case UserRole.Normal:
			return 'mdi-account';
	}
}

</script>

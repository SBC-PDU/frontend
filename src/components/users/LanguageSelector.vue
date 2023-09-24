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
	<v-select
		:model-value='modelValue'
		:items='[
			{title: "🇬🇧 " + $t("core.locales.en"), value: UserLanguage.English},
			{title: "🇨🇿 " + $t("core.locales.cs"), value: UserLanguage.Czech},
		]'
		:label='$t("core.user.fields.language")'
		:rules='[
			v => FormValidator.isRequired(v, $t("core.user.messages.emptyLanguage")),
		]'
		required
		:prepend-inner-icon='mdiTranslate'
		@update:model-value='$emit("update:modelValue", $event)'
	/>
</template>

<script lang='ts' setup>
import {mdiTranslate} from '@mdi/js';

import FormValidator from '@/helpers/formValidator';
import {UserLanguage} from '@/types/user';

/**
 * User language selector props
 */
interface Props {
  modelValue: UserLanguage;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits(['update:modelValue']);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<Props>();
</script>

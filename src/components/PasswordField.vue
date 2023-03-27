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
	<v-text-field
		:model-value='modelValue'
		v-bind='$attrs'
		:append-icon='showPassword ? "mdi-eye" : "mdi-eye-off"'
		:type='showPassword ? "text": "password"'
		@click:append='showPassword = !showPassword'
	/>
</template>

<script lang='ts' setup>
import {ref, Ref} from 'vue';

const showPassword: Ref<boolean> = ref(false);
const props = defineProps({
	modelValue: {
		type: String,
		required: true,
	},
});
</script>

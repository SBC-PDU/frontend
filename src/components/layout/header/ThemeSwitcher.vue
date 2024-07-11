<!--
Copyright 2022-2024 Roman Ondráček <mail@romanondracek.cz>

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
	<v-btn
		v-model='themeSwitch'
		:icon='themeSwitch ? mdiWeatherSunny : mdiWeatherNight'
		@click='toggleTheme'
	/>
</template>

<script lang='ts' setup>
import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, type Ref, watch } from 'vue';

import { useThemeStore } from '@/store/theme';
import { Theme } from '@/types/theme';

const themeStore = useThemeStore();
const { getTheme: currentTheme } = storeToRefs(themeStore);
const themeSwitch: Ref<boolean> = ref(false);

/**
 * Toggles the theme
 */
async function toggleTheme(): Promise<void> {
	await themeStore.toggleTheme();
}

onBeforeMount((): void => {
	themeSwitch.value = currentTheme.value === Theme.Dark;
});

watch(currentTheme, (value: Theme): void => {
	themeSwitch.value = value === Theme.Dark;
});
</script>

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
	<Card header-color='grey'>
		<template #title>
			<v-icon>mdi-chart-timeline-variant</v-icon>
			{{ $t('core.devices.detail.measurements.title') }}
			<div class='float-end'>
				<v-menu>
					<template v-slot:activator='{props}'>
						<v-btn
							color='primary'
							prepend-icon='mdi-timelapse'
							append-icon='mdi-menu-down'
							v-bind='props'
						>
							{{ $t(`core.devices.detail.measurements.timeRanges.${timeRange}`) }}
						</v-btn>
					</template>
					<v-list density='compact'>
						<v-list-item v-for='time in timeRanges' :key='time' @click='fetchData(time)'>
							<v-list-item-title>{{ $t(`core.devices.detail.measurements.timeRanges.${time}`) }}</v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu> <v-btn
					color='primary'
					prepend-icon='mdi-refresh'
					@click='fetchData(timeRange)'
				>{{ $t('core.devices.detail.measurements.reload') }}
				</v-btn>
			</div>
		</template>
		<v-chart
			v-if='loaded'
			:autoresize='true'
			:option='options'
			class='chart'
		/>
	</Card>
</template>

<script lang='ts' setup>
import {EChartsOption, SeriesOption} from 'echarts';
import {LineChart} from 'echarts/charts';
import {
	DataZoomComponent,
	GridComponent,
	LegendComponent,
	TitleComponent,
	ToolboxComponent,
	TooltipComponent,
} from 'echarts/components';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {reactive, Ref, ref, watchEffect} from 'vue';
import VChart from 'vue-echarts';
import {useI18n} from 'vue-i18n';
import {toast} from 'vue3-toastify';

import Card from '@/components/Card.vue';
import DeviceService from '@/services/DeviceService';
import {useLoadingSpinnerStore} from '@/store/loadingSpinner';
import {
	DeviceDetail,
	DeviceOutputWithMeasurements,
	DeviceOutputMeasurement,
	DeviceOutputMeasurements,
} from '@/types/device';

use([
	CanvasRenderer,
	DataZoomComponent,
	GridComponent,
	LineChart,
	TitleComponent,
	ToolboxComponent,
	TooltipComponent,
	LegendComponent,
]);

interface Props {
	/// Device
	device: DeviceDetail;
}

const i18n = useI18n();
const service = new DeviceService();
const props = defineProps<Props>();
const loaded: Ref<boolean> = ref(false);
const loadingSpinner = useLoadingSpinnerStore();
const data: Ref<DeviceOutputMeasurements[]> = ref<DeviceOutputMeasurements[]>([]);
const legend = ref<string[]>([]);
const series = ref<SeriesOption[]>([]);
const timeRange = ref<string>('1h');
const timeRanges: Array<string> = ['5m', '15m', '1h', '6h', '12h', '1d','1w', '1mo'];

/**
 * Fetches the measurements
 * @param {string} newTimeRange New time range
 */
async function fetchData(newTimeRange: string): Promise<void> {
	loadingSpinner.show();
	if (timeRange.value !== newTimeRange) {
		timeRange.value = newTimeRange;
	}
	await service.getMeasurements(props.device.id, timeRange.value).then((measurements: DeviceOutputMeasurements[]) => {
		data.value = measurements;
		loaded.value = true;
		const newSeries: SeriesOption[] = [];
		for (const index in data.value) {
			const output: DeviceOutputMeasurements = data.value[index];
			newSeries.push({
				name: `#${output.index} - ${props.device.outputs[index].name}`,
				type: 'line',
				smooth: true,
				symbol: 'none',
				data: output.measurements.current.map((measurement: DeviceOutputMeasurement): [Date, number] => [measurement.time, measurement.value]),
				connectNulls: false,
				tooltip: {
					valueFormatter: (value): string => (Number(value).toFixed(2).toString() + ' mA'),
				},
			});
			newSeries.push({
				name: `#${output.index} - ${props.device.outputs[index].name}`,
				type: 'line',
				smooth: true,
				symbol: 'none',
				data: output.measurements.voltage.map((measurement: DeviceOutputMeasurement): [Date, number] => [measurement.time, measurement.value]),
				connectNulls: false,
				yAxisIndex: 1,
				xAxisIndex: 1,
				tooltip: {
					valueFormatter: (value): string => (Number(value).toFixed(2).toString() + ' V'),
				},
			});
		}
		legend.value = Object.values(props.device.outputs).map((output: DeviceOutputWithMeasurements) => (`#${output.index} - ${output.name}`));
		series.value = newSeries;
		loadingSpinner.hide();
	}).catch(() => {
		toast.error(i18n.t('core.devices.detail.measurements.messages.error').toString());
		loadingSpinner.hide();
	});
}

watchEffect(async () => {
	await fetchData(timeRange.value);
});

/**
 * Chart options
 */
const options: EChartsOption = reactive({
	tooltip: {
		trigger: 'axis',
	},
	title: [
		{
			left: 'center',
			text: i18n.t('core.devices.detail.measurements.current').toString(),
		},
		{
			top: '55%',
			left: 'center',
			text: i18n.t('core.devices.detail.measurements.voltage').toString(),
		}
	],
	legend: {
		data: legend,
		top: '48%',
	},
	toolbox: {
		feature: {
			saveAsImage: {}
		}
	},
	grid: [
		{
			bottom: '60%',
		},
		{
			top: '60%',
		}
	],
	xAxis: [
		{
			type: 'time',
			boundaryGap: false,
			gridIndex: 0,
		},
		{
			type: 'time',
			boundaryGap: false,
			gridIndex: 1,
		},
	],
	yAxis: [
		{
			type: 'value',
			min: 0,
			gridIndex: 0,
			axisLabel: {
				formatter: '{value} mA',
			},
		},
		{
			type: 'value',
			min: 0,
			gridIndex: 1,
			axisLabel: {
				formatter: '{value} V',
			},
		},
	],
	dataZoom: [
		{
			type: 'inside',
			xAxisIndex: [0, 1],
		},
		{
			xAxisIndex: [0, 1],
		},
		{
			type: 'inside',
			yAxisIndex: 0,
			labelFormatter: '{value} mA',
			filterMode: 'weakFilter',
		},
		{
			yAxisIndex: 0,
			labelFormatter: '{value} mA',
			filterMode: 'weakFilter',
		},
		{
			type: 'inside',
			yAxisIndex: 1,
			labelFormatter: '{value} V',
			filterMode: 'weakFilter',
		},
		{
			yAxisIndex: 1,
			labelFormatter: '{value} V',
			filterMode: 'weakFilter',
		},
	],
	series: series,
});

</script>

<style>
.chart {
	height: 800px;
}
</style>

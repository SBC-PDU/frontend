/**
 * Copyright 2022-2023 Roman Ondráček
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';

import {useUserStore} from '@/store/user';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('@/layouts/default/Dashboard.vue'),
		children: [
			{
				path: ':pathMatch(.*)*',
				name: 'NotFound',
				component: () => import('@/views/NotFound.vue'),
			},
			{
				path: ':pathMatch(.*)',
				name: 'BadNotFound',
				component: () => import('@/views/NotFound.vue'),
			},
			{
				path: '',
				name: 'Home',
				redirect: {name: 'DeviceList'},
			},
			{
				path: 'account',
				children: [
					{
						path: 'verification',
						children: [
							{
								path: ':uuid',
								name: 'AccountVerification',
								component: () => import('@/views/account/AccountVerification.vue'),
								props: true,
							},
						],
					},
				],
			},
			{
				path: 'admin',
				component: () => import('@/layouts/admin/AdminDashboard.vue'),
				children: [
					{
						path: 'users',
						children: [
							{
								path: '',
								name: 'Users',
								component: () => import('@/views/admin/UserList.vue'),
							},
						],
					},
				],
			},
			{
				path: 'auth',
				children: [
					{
						path: 'password',
						children: [
							{
								path: 'recovery',
								name: 'PasswordRecovery',
								component: () => import('@/views/auth/PasswordRecovery.vue'),
							},
							{
								path: 'reset/:uuid',
								name: 'PasswordReset',
								component: () => import('@/views/auth/PasswordReset.vue'),
								props: true,
							},
							{
								path: 'set/:uuid',
								name: 'PasswordSet',
								component: () => import('@/views/auth/PasswordSet.vue'),
								props: true,
							},
						],
					},
					{
						path: 'sign',
						children: [
							{
								path: 'in',
								name: 'SignIn',
								component: () => import('@/views/auth/SignIn.vue'),
							},
						],
					},
				],
			},
			{
				path: 'apiDocs',
				name: 'ApiDocs',
				component: () => import('@/views/OpenApi.vue'),
			},
			{
				path: 'devices',
				children: [
					{
						path: '',
						name: 'DeviceList',
						component: () => import('@/views/devices/DeviceList.vue'),
					},
					{
						path: ':id',
						name: 'DeviceDetail',
						component: () => import('@/views/devices/DeviceDetail.vue'),
						props: true,
					},
				],
			},
			{
				path: 'profile',
				name: 'Profile',
				component: () => import('@/views/account/Profile.vue'),
			},
		],
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

router.beforeEach(async (to, from, next) => {
	const userStore = useUserStore();
	const whitelist = [
		'ApiDocs',
		'AccountVerification',
		'BadNotFound',
		'NotFound',
		'PasswordRecovery',
		'PasswordReset',
		'PasswordSet',
		'SignIn',
		'SignUp',
	];
	if (!userStore.isLoggedIn && !whitelist.includes(to.name as string)) {
		let query = {...to.query};
		if (to.path !== '/' && to.name !== 'SignIn') {
			query = {...query, redirect: to.path};
		}
		return next({name: 'SignIn', query});
	}
	if (to.name === 'SignIn' && userStore.isLoggedIn) {
		return next((to.query.redirect as string | undefined) ?? '/');
	}
	next();
});

export default router;

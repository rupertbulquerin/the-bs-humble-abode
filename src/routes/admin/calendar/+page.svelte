<script lang="ts">
	export let data;
	import { onMount } from 'svelte';
	import {
		format,
		addMonths,
		startOfMonth,
		endOfMonth,
		eachDayOfInterval,
		isToday,
		isSameDay,
		isWithinInterval,
		startOfDay
	} from 'date-fns';
	import { convertToManila } from '$lib/dates';
	import SyncInterval from './SyncInterval.svelte';

	let activeTab = 'view';
	$: calendars = data.calendars;
	let newCalendar = {
		name: '',
		syncUrl: ''
	};
	let isLoading = false;
	let error = '';
	let success = '';

	// For manual date blocking
	let blockStart = '';
	let blockEnd = '';
	let blockReason = '';
	$: blockedDates = data.blockedDates;
	let currentMonth = new Date();
	let isCalendarLoading = false;
	$: bookedDates = data.bookedDates.map((date) => ({
		start: convertToManila(new Date(date.start)),
		end: convertToManila(new Date(date.end)),
		source: date.source
	}));
	$: displayMonths = [currentMonth, addMonths(currentMonth, 1), addMonths(currentMonth, 2)];
	$: selectedStartDate = blockStart ? new Date(blockStart) : null;
	$: selectedEndDate = blockEnd ? new Date(blockEnd) : null;

	async function fetchAllBookedDates() {
		try {
			const response = await fetch('/api/calendar');
			const data = await response.json();
			bookedDates = data.bookedDates.map((date) => ({
				start: convertToManila(new Date(date.start)),
				end: convertToManila(new Date(date.end)),
				source: date.source
			}));
		} catch (error) {
			console.error('Failed to fetch booked dates:', error);
		}
	}

	function getDaysInMonth(date: Date) {
		const start = startOfMonth(date);
		const end = endOfMonth(date);
		const days = eachDayOfInterval({ start, end });
		
		// Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
		const firstDayOfMonth = start.getDay();
		
		// Create empty spaces for the days from previous month
		const emptyDays = Array(firstDayOfMonth).fill(null);
		
		return [...emptyDays, ...days];
	}

    function isFromCurrentMonth(date: Date, currentMonth: Date) {
		return date.getMonth() === currentMonth.getMonth();
	}

	function isDateBlocked(date: Date) {
		const manilaDate = convertToManila(date);
		return bookedDates.some((blocked) => 
			isWithinInterval(startOfDay(manilaDate), {
				start: new Date(blocked.start),
				end: new Date(blocked.end)
			})
		);
	}

	function getBlockSource(date: Date) {
		const manilaDate = convertToManila(date);
		const block = bookedDates.find((blocked) =>
			isWithinInterval(startOfDay(manilaDate), {
				start: new Date(blocked.start),
				end: new Date(blocked.end)
			})
		);
		return block?.source || '';
	}

	function handleDateClick(date: Date) {
		if (isDateBlocked(date)) return;

		if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
			selectedStartDate = date;
			selectedEndDate = null;
			blockStart = format(date, 'yyyy-MM-dd');
			blockEnd = '';
		} else {
			if (date < selectedStartDate) {
				selectedStartDate = date;
				blockStart = format(date, 'yyyy-MM-dd');
			} else {
				selectedEndDate = date;
				blockEnd = format(date, 'yyyy-MM-dd');
			}
		}
	}

	function isSelected(date: Date) {
		return (
			(selectedStartDate && isSameDay(date, selectedStartDate)) ||
			(selectedEndDate && isSameDay(date, selectedEndDate))
		);
	}

	function isInRange(date: Date) {
		return (
			selectedStartDate &&
			selectedEndDate &&
			isWithinInterval(date, { start: selectedStartDate, end: selectedEndDate })
		);
	}

	function nextMonth() {
		currentMonth = addMonths(currentMonth, 1);
	}

	function prevMonth() {
		currentMonth = addMonths(currentMonth, -1);
	}

	async function loadBlockedDates() {
		try {
			const response = await fetch('/api/admin/blocked-dates');
			const data = await response.json();
			blockedDates = data.blockedDates;
		} catch (err) {
			error = 'Failed to load blocked dates';
		}
	}

	async function addBlockedDate() {
		try {
			isLoading = true;
			error = '';
			const response = await fetch('/api/admin/blocked-dates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					startDate: blockStart,
					endDate: blockEnd,
					reason: blockReason
				})
			});

			if (!response.ok) throw new Error('Failed to block dates');

			// Update both lists first
			await Promise.all([loadBlockedDates(), fetchAllBookedDates()]);

			// Reset form and show success
			success = 'Dates blocked successfully';
			blockStart = '';
			blockEnd = '';
			blockReason = '';
			selectedStartDate = null;
			selectedEndDate = null;

			// Clear success message after 3 seconds
			setTimeout(() => {
				success = '';
			}, 3000);
		} catch (err) {
			error = 'Failed to block dates';
		} finally {
			isLoading = false;
		}
	}

	async function removeBlockedDate(id: string) {
		try {
			isLoading = true;
			error = '';
			const response = await fetch(`/api/admin/blocked-dates/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) throw new Error('Failed to remove blocked date');

			// Update both lists
			await Promise.all([loadBlockedDates(), fetchAllBookedDates()]);

			success = 'Date block removed successfully';

			// Clear success message after 3 seconds
			setTimeout(() => {
				success = '';
			}, 3000);
		} catch (err) {
			error = 'Failed to remove blocked date';
		} finally {
			isLoading = false;
		}
	}

	async function loadCalendars() {
		try {
			const response = await fetch('/api/admin/calendars');
			const data = await response.json();
			calendars = data.calendars;
		} catch (err) {
			error = 'Failed to load calendars';
		}
	}

	async function addCalendar() {
		try {
			isLoading = true;
			const response = await fetch('/api/admin/calendars', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCalendar)
			});

			if (!response.ok) throw new Error('Failed to add calendar');

			success = 'Calendar added successfully';
			await loadCalendars();
			newCalendar = { name: '', syncUrl: '' };
		} catch (err) {
			error = 'Failed to add calendar';
		} finally {
			isLoading = false;
		}
	}

	async function toggleCalendar(id: string, isActive: boolean) {
		try {
			const response = await fetch(`/api/admin/calendars/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive })
			});

			if (!response.ok) throw new Error('Failed to update calendar');
			success = 'Calendar updated successfully';
			await loadCalendars();
		} catch (err) {
			error = 'Failed to update calendar';
		}
	}

	async function syncCalendar(id: string) {
		try {
			const response = await fetch(`/api/admin/calendars/${id}/sync`, {
				method: 'POST'
			});

			if (!response.ok) throw new Error('Failed to sync calendar');
			success = 'Calendar synced successfully';
			await loadCalendars();
		} catch (err) {
			error = 'Failed to sync calendar';
		}
	}

	function calculateDuration(start: Date, end: Date) {
		const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
		return days === 1 ? '1 day' : `${days} days`;
	}

	// Modify the reactive statement (around line 222-229)
	$: {
		if (activeTab === 'view' && typeof window !== 'undefined') {
			isCalendarLoading = true;
			Promise.all([loadBlockedDates(), fetchAllBookedDates()]).finally(() => {
				isCalendarLoading = false;
			});
		}
	}

	// Modify onMount (around line 232-248)
	onMount(async () => {
		isCalendarLoading = true;
		await Promise.all([loadCalendars(), loadBlockedDates(), fetchAllBookedDates()]).finally(() => {
			isCalendarLoading = false;
		});

		// Poll for updates every minute
		const pollInterval = setInterval(async () => {
			Promise.all([fetchAllBookedDates(), loadBlockedDates()]);
		}, 60000);

		return () => clearInterval(pollInterval);
	});
</script>

<div class="container mx-auto px-4">
	<div class="mb-8">
		<h1 class="mb-4 text-2xl font-bold">Calendar Management</h1>

		{#if error}
			<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
				{success}
			</div>
		{/if}

		<!-- Tabs -->
		<div class="mb-6 border-b border-gray-200">
			<nav class="-mb-px flex space-x-8">
				<button
					class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'view'
						? 'border-gray-800 text-gray-800'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					on:click={() => (activeTab = 'view')}
				>
					Calendar View
				</button>
				<button
					class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'manage'
						? 'border-gray-800 text-gray-800'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					on:click={() => (activeTab = 'manage')}
				>
					Calendar Management
				</button>
			</nav>
		</div>

		{#if activeTab === 'view'}
			<div class="mb-6 rounded-lg bg-white p-6 shadow-lg">
				{#if isCalendarLoading}
					<div class="flex h-64 items-center justify-center">
						<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-800"></div>
					</div>
				{:else}
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-xl font-semibold">Block Dates</h2>
						<div class="flex gap-2">
							<button type="button" class="rounded-full p-1 hover:bg-gray-100" on:click={prevMonth}>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<button type="button" class="rounded-full p-1 hover:bg-gray-100" on:click={nextMonth}>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
						{#each displayMonths as month}
							<div class="w-full">
								<div class="mb-4 text-center">
									<span class="font-medium">{format(month, 'MMMM yyyy')}</span>
								</div>
								<div class="grid grid-cols-7 gap-1 text-center text-sm">
									{#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as day}
										<div class="p-2 text-gray-500">{day}</div>
									{/each}
									{#each getDaysInMonth(month) as date}
										{#if date === null}
											<div class="p-2"></div>
										{:else}
											<button
												type="button"
												disabled={isDateBlocked(date)}
												class="relative rounded-lg p-2 pb-4
												{!isFromCurrentMonth(date, month) ? 'opacity-50' : ''}
												{isDateBlocked(date)
													? getBlockSource(date).includes('Manual Block')
														? 'cursor-not-allowed bg-gray-300 text-gray-700'
														: 'cursor-not-allowed bg-gray-400 text-white'
													: 'hover:bg-gray-100'}
												{isSelected(date) ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
												{isInRange(date) ? 'bg-gray-100' : ''}
												{isToday(date) ? 'font-bold' : ''}"
												title={isDateBlocked(date) ? getBlockSource(date) : ''}
												on:click={() => handleDateClick(date)}
											>
												{format(date, 'd')}
												{#if isDateBlocked(date)}
													<span
														class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px]
														{getBlockSource(date).includes('Manual Block')
															? 'text-gray-800'
															: 'text-gray-100'}"
													>
														{getBlockSource(date).includes('Manual Block') ? 'Blocked' : 'Booked'}
													</span>
												{/if}
											</button>
										{/if}
									{/each}
								</div>
							</div>
						{/each}
					</div>

					<form on:submit|preventDefault={addBlockedDate} class="mt-6 space-y-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div>
								<label for="reason" class="block text-sm font-medium text-gray-700">Reason</label>
								<div class="relative mt-1">
									<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										<svg
											class="h-5 w-5 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</div>
									<input
										type="text"
										id="reason"
										bind:value={blockReason}
										required
										placeholder="e.g., Maintenance"
										class="w-full rounded-md border-gray-300 py-2.5 pr-3 pl-10 shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
									/>
								</div>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading || !blockStart || !blockEnd}
							class="w-full rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50 md:w-auto"
						>
							{isLoading ? 'Blocking...' : 'Block Selected Dates'}
						</button>
					</form>
				{/if}
			</div>

			<!-- Blocked Dates List -->
			<div class="rounded-lg bg-white shadow-lg">
				<div class="border-b border-gray-200 px-6 py-4">
					<h2 class="text-lg font-semibold text-gray-900">Blocked Dates</h2>
					<p class="mt-1 text-sm text-gray-500">List of manually blocked dates</p>
				</div>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>Date Range</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>Duration</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>Reason</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each blockedDates as block}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4">
										<div class="text-sm text-gray-900">
											{format(new Date(block.startDate), 'MMMM d, yyyy')}
											{#if block.startDate !== block.endDate}
												<span class="mx-2 text-gray-500">→</span>
												{format(new Date(block.endDate), 'MMMM d, yyyy')}
											{/if}
										</div>
									</td>
									<td class="px-6 py-4">
										<div class="text-sm text-gray-500">
											{calculateDuration(new Date(block.startDate), new Date(block.endDate))}
										</div>
									</td>
									<td class="px-6 py-4">
										<div class="text-sm text-gray-900">{block.reason}</div>
									</td>
									<td class="px-6 py-4">
										<button
											on:click={() => removeBlockedDate(block.id)}
											class="inline-flex cursor-pointer items-center rounded-md border border-transparent bg-red-50 px-3 py-1 text-sm leading-4 font-medium text-red-700 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
										>
											Remove
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<!-- Sync Settings -->
			<!-- <div class="mb-6 rounded-lg bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-xl font-semibold">Sync Settings</h2>
				<p class="mb-4 text-sm text-gray-600">
					Configure how often the system checks for updates from external calendars.
				</p>
				<SyncInterval />
			</div> -->

			<!-- Add New Calendar Form -->
			<div class="mb-6 rounded-lg bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-xl font-semibold">Add New Calendar</h2>
				<form on:submit|preventDefault={addCalendar} class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700">Calendar Name</label
							>
							<input
								type="text"
								id="name"
								bind:value={newCalendar.name}
								required
								placeholder="e.g., Airbnb Calendar"
								class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
							/>
						</div>

						<div>
							<label for="syncUrl" class="block text-sm font-medium text-gray-700">iCal URL</label>
							<input
								type="url"
								id="syncUrl"
								bind:value={newCalendar.syncUrl}
								required
								placeholder="https://..."
								class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						class="w-full rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 md:w-auto"
					>
						{isLoading ? 'Adding...' : 'Add Calendar'}
					</button>
				</form>
			</div>

			<!-- Calendar List -->
			<div class="rounded-lg bg-white shadow-lg">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Last Sync</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Status</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each calendars as calendar}
								<tr>
									<td class="px-6 py-4">{calendar.name}</td>
									<td class="px-6 py-4">
										{new Date(calendar.lastSync).toLocaleString()}
									</td>
									<td class="px-6 py-4">
										<span
											class={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${calendar.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
										>
											{calendar.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="space-x-2 px-6 py-4">
										<button
											on:click={() => syncCalendar(calendar.id)}
											class="text-sm text-blue-600 hover:text-blue-900"
										>
											Sync Now
										</button>
										<button
											on:click={() => toggleCalendar(calendar.id, !calendar.isActive)}
											class="text-sm text-gray-600 hover:text-gray-900"
										>
											{calendar.isActive ? 'Disable' : 'Enable'}
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import {
		format,
		addMonths,
		startOfMonth,
		endOfMonth,
		eachDayOfInterval,
		isToday,
		isSameDay,
		isWithinInterval,
		isBefore,
		startOfDay
	} from 'date-fns';
	import { convertToManila } from '$lib/dates';
	import { onMount } from 'svelte';

	export let checkIn: string;
	export let checkOut: string;
	export let class_name: string = '';
	export let showCalendar: boolean = false;
	export let minStay: number = 1; // Minimum nights required
	export let pricePerNight: number;

	let currentMonth = new Date();
	let calendarContainer: HTMLDivElement;

	$: displayMonths = [currentMonth, addMonths(currentMonth, 1)];
	$: selectedStartDate = checkIn ? new Date(checkIn) : null;
	$: selectedEndDate = checkOut ? new Date(checkOut) : null;

	let blockedDates: { start: Date; end: Date }[] = [];

	let pollInterval: NodeJS.Timeout;
	let isLoading = true;

	let hoveredDate: Date | null = null;

	$: selectedNights = selectedStartDate && selectedEndDate 
		? Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24))
		: 0;
		
	$: totalPrice = selectedNights * pricePerNight;

	let error: string | null = null;

	async function fetchBlockedDates() {
		error = null;
		isLoading = true;
		try {
			const response = await fetch('/api/calendar');
			const data = await response.json();
			blockedDates = data.bookedDates.map((date: any) => ({
				start: convertToManila(new Date(date.start)),
				end: convertToManila(new Date(date.end))
			}));
		} catch (err) {
			console.error('Failed to fetch blocked dates:', err);
			error = 'Failed to load availability. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function isDateBlocked(date: Date) {
		const manilaDate = convertToManila(date);
		return blockedDates.some((blocked) =>
			isWithinInterval(startOfDay(manilaDate), {
				start: new Date(blocked.start),
				end: new Date(blocked.end)
			})
		);
	}

	function isDateRangeBlocked(start: Date, end: Date) {
		const manilaStart = convertToManila(start);
		const manilaEnd = convertToManila(end);
		return blockedDates.some((blocked) => {
			return (
				(manilaStart <= blocked.end && manilaEnd >= blocked.start) ||
				isWithinInterval(blocked.start, { start: manilaStart, end: manilaEnd }) ||
				isWithinInterval(blocked.end, { start: manilaStart, end: manilaEnd })
			);
		});
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

	function handleDateClick(date: Date) {
		if (isDateBlocked(date)) return;

		if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
			selectedStartDate = date;
			selectedEndDate = null;
			checkIn = format(date, 'yyyy-MM-dd');
			checkOut = '';
		} else {
			if (date < selectedStartDate) {
				selectedStartDate = date;
				checkIn = format(date, 'yyyy-MM-dd');
			} else {
				// Check if the selected range overlaps with any blocked dates
				if (isDateRangeBlocked(selectedStartDate, date)) {
					// If overlapping, reset selection
					selectedStartDate = date;
					selectedEndDate = null;
					checkIn = format(date, 'yyyy-MM-dd');
					checkOut = '';
					return;
				}
				const diffTime = Math.abs(date.getTime() - selectedStartDate.getTime());
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				
				if (diffDays < minStay) {
					// Show error or tooltip
					return;
				}
				selectedEndDate = date;
				checkOut = format(date, 'yyyy-MM-dd');
				showCalendar = false;
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

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		// Check if the click is on a date picker button or inside the calendar
		const isDatePickerButton = target.closest('button[data-datepicker-trigger]');
		const isInsideCalendar = calendarContainer?.contains(target);

		if (!isDatePickerButton && !isInsideCalendar) {
			showCalendar = false;
		}
	}

	function handleDateHover(date: Date) {
		hoveredDate = date;
	}

	function handleDateLeave() {
		hoveredDate = null;
	}

	function getDateTooltip(date: Date) {
		if (isDateBlocked(date)) return "Not available";
		if (selectedStartDate && date < selectedStartDate) return "Select as new start date";
		if (selectedStartDate && !selectedEndDate) {
			const diffTime = Math.abs(date.getTime() - selectedStartDate.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return `Select for ${diffDays} night${diffDays !== 1 ? 's' : ''}`;
		}
		return "Select date";
	}

	function clearSelection() {
		selectedStartDate = null;
		selectedEndDate = null;
		checkIn = '';
		checkOut = '';
	}

	onMount(() => {
		fetchBlockedDates();
		// Poll every 15 minutes for updates
		pollInterval = setInterval(fetchBlockedDates, 900000);
		document.addEventListener('click', handleClickOutside);
		return () => {
			if (pollInterval) clearInterval(pollInterval);
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative {class_name}">
	{#if showCalendar}
		<div
			bind:this={calendarContainer}
			class="absolute top-2 left-0 z-50 w-full max-h-[80vh] overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:w-[690px]"
		>
			{#if isLoading}
				<div class="absolute inset-0 flex items-center justify-center bg-white/80">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
				</div>
			{/if}
			{#if error}
				<div class="p-2 bg-red-50 text-red-700 rounded text-sm mt-2">
					{error}
					<button 
						type="button" 
						class="ml-2 underline" 
						on:click={fetchBlockedDates}
					>
						Retry
					</button>
				</div>
			{/if}
			<div class="flex flex-col gap-4 sm:flex-row">
				{#each displayMonths as month}
					<div class="w-full">
						<div class="mb-4 flex items-center justify-between">
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
							<span class="font-medium">{format(month, 'MMMM yyyy')}</span>
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
										class="relative rounded-full p-2
										{isDateBlocked(date)
											? 'cursor-not-allowed bg-red-50 text-gray-400 line-through'
											: 'hover:bg-gray-100'}
										{isSelected(date) ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
										{isInRange(date) ? 'bg-gray-100' : ''}
										{isToday(date) ? 'font-bold' : ''}"
										on:click={() => handleDateClick(date)}
										on:mouseenter={() => handleDateHover(date)}
										on:mouseleave={handleDateLeave}
									>
										{format(date, 'd')}
										
										{#if hoveredDate && isSameDay(date, hoveredDate)}
											<div class="absolute bottom-full z-10 left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white">
												{getDateTooltip(date)}
											</div>
										{/if}
									</button>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<button 
				type="button"
				class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 sm:hidden"
				on:click={() => showCalendar = false}
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			{#if selectedStartDate}
				<div class="mt-2 flex justify-end">
					<button 
						type="button"
						class="text-sm text-gray-500 hover:text-gray-700 underline"
						on:click={clearSelection}
					>
						Clear selection
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<div class="text-xs text-gray-500 mt-1">
	Minimum stay: {minStay} {minStay === 1 ? 'night' : 'nights'}
</div>
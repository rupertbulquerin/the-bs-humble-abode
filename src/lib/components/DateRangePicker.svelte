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
	import { onMount } from 'svelte';

	export let checkIn: string;
	export let checkOut: string;
	export let class_name: string = '';
	export let showCalendar: boolean = false;

	let currentMonth = new Date();
	let calendarContainer: HTMLDivElement;

	$: displayMonths = [currentMonth, addMonths(currentMonth, 1)];
	$: selectedStartDate = checkIn ? new Date(checkIn) : null;
	$: selectedEndDate = checkOut ? new Date(checkOut) : null;

	let blockedDates: { start: Date; end: Date }[] = [];

	let pollInterval: NodeJS.Timeout;

	async function fetchBlockedDates() {
		try {
			const response = await fetch('/api/calendar');
			const data = await response.json();
			blockedDates = data.bookedDates.map((date: any) => ({
				start: new Date(date.start),
				end: new Date(date.end)
			}));
		} catch (error) {
			console.error('Failed to fetch blocked dates:', error);
		}
	}

	function isDateBlocked(date: Date) {
		return blockedDates.some((blocked) =>
			isWithinInterval(startOfDay(date), {
				start: new Date(blocked.start),
				end: new Date(blocked.end)
			})
		);
	}

	function isDateRangeBlocked(start: Date, end: Date) {
		return blockedDates.some((blocked) => {
			// Check if any part of the selected range overlaps with blocked dates
			return (
				(start <= blocked.end && end >= blocked.start) ||
				isWithinInterval(blocked.start, { start, end }) ||
				isWithinInterval(blocked.end, { start, end })
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

	onMount(() => {
		fetchBlockedDates();
		// Poll every minute for updates
		pollInterval = setInterval(fetchBlockedDates, 60000);
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
			class="absolute top-2 left-0 z-50 w-full rounded-lg bg-white p-4 shadow-xl sm:w-[690px]"
		>
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
										class="rounded-full p-2
										{isDateBlocked(date)
											? 'cursor-not-allowed bg-red-50 text-gray-400 line-through'
											: 'hover:bg-gray-100'}
										{isSelected(date) ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
										{isInRange(date) ? 'bg-gray-100' : ''}
										{isToday(date) ? 'font-bold' : ''}"
										on:click={() => handleDateClick(date)}
									>
										{format(date, 'd')}
									</button>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

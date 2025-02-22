<script lang="ts">
  import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isWithinInterval, isBefore } from 'date-fns';
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
    return blockedDates.some(blocked => 
      isWithinInterval(date, { start: blocked.start, end: blocked.end })
    );
  }

  function isDateRangeBlocked(start: Date, end: Date) {
    return blockedDates.some(blocked => {
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
    return eachDayOfInterval({ start, end });
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
    return selectedStartDate && isSameDay(date, selectedStartDate) || 
           selectedEndDate && isSameDay(date, selectedEndDate);
  }

  function isInRange(date: Date) {
    return selectedStartDate && selectedEndDate && 
           isWithinInterval(date, { start: selectedStartDate, end: selectedEndDate });
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
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="relative {class_name}">


  {#if showCalendar}
    <div 
      bind:this={calendarContainer}
      class="absolute left-0 top-2 z-50 w-full sm:w-[690px] rounded-lg bg-white p-4 shadow-xl"
    >
      <div class="flex flex-col sm:flex-row gap-4">
        {#each displayMonths as month}
          <div class="w-full">
            <div class="flex items-center justify-between mb-4">
              <button 
                type="button" 
                class="p-1 hover:bg-gray-100 rounded-full" 
                on:click={prevMonth}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span class="font-medium">{format(month, 'MMMM yyyy')}</span>
              <button 
                type="button" 
                class="p-1 hover:bg-gray-100 rounded-full"
                on:click={nextMonth}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-7 gap-1 text-center text-sm">
              {#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as day}
                <div class="p-2 text-gray-500">{day}</div>
              {/each}
              {#each getDaysInMonth(month) as date}
                <button
                  type="button"
                  disabled={isDateBlocked(date)}
                  class="p-2 rounded-full 
                    {isDateBlocked(date) ? 'bg-red-50 text-gray-400 cursor-not-allowed line-through' : 'hover:bg-gray-100'}
                    {isSelected(date) ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                    {isInRange(date) ? 'bg-gray-100' : ''}
                    {isToday(date) ? 'font-bold' : ''}"
                  on:click={() => handleDateClick(date)}
                >
                  {format(date, 'd')}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div> 
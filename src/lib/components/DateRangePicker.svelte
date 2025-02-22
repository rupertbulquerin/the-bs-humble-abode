<script lang="ts">
  import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isWithinInterval } from 'date-fns';
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

  function getDaysInMonth(date: Date) {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  }

  function handleDateClick(date: Date) {
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
      class="absolute left-0 top-2 z-50 w-[690px] rounded-lg bg-white p-4 shadow-xl"
    >
      <div class="flex justify-between">
        <button type="button" class="p-2" on:click={prevMonth}>←</button>
        <div class="flex gap-4">
          {#each displayMonths as month}
            <div class="w-72">
              <div class="mb-4 text-center font-semibold">
                {format(month, 'MMMM yyyy')}
              </div>
              <div class="grid grid-cols-7 gap-1 text-center text-sm">
                {#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as day}
                  <div class="p-2 text-gray-500">{day}</div>
                {/each}
                {#each getDaysInMonth(month) as date}
                  <button
                    type="button"
                    class="p-2 rounded-full hover:bg-gray-100 
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
        <button type="button" class="p-2" on:click={nextMonth}>→</button>
      </div>
    </div>
  {/if}
</div> 
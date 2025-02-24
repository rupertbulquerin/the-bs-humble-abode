<script lang="ts">
    import { format, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
    import DateRangePicker from './DateRangePicker.svelte';
    import { onMount } from 'svelte';
    import GCashPayment from './GCashPayment.svelte';
    import PaymentMethodSelect from './PaymentMethodSelect.svelte';
	import { convertToManila } from '$lib/dates';
  
    export let price: number;
    export let extraPersonFee: number;
  
    let firstName = '';
    let lastName = '';
    let email = '';
    let phone = '';
    let checkIn = '';
    let checkOut = '';
    let guests = 2;
    let specialRequests = '';
    let showCalendar = false;
    let showPayment = false;
    let bookingData: any = null;
    let isProcessing = false;
    let showSuccessModal = false;
    let paymentInstructions = '';
    let pollInterval: NodeJS.Timeout;
  
    $: numberOfNights = checkIn && checkOut 
      ? (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      : 0;
  
    $: extraGuestsFee = guests > 2 ? (guests - 2) * extraPersonFee * numberOfNights : 0;
    $: basePrice = numberOfNights * price;
    $: totalPrice = basePrice + extraGuestsFee;
  
    async function initializeDates() {
      try {
        const response = await fetch('/api/calendar');
        const data = await response.json();
        const blockedDates = data.bookedDates.map((date: any) => ({
          start: new Date(date.start),
          end: new Date(date.end)
        }));
  
        // Find the first available date
        let currentDate = new Date();
        while (blockedDates.some(blocked => 
          isWithinInterval(startOfDay(convertToManila(currentDate)), { 
            start: startOfDay(blocked.start), 
            end: endOfDay(blocked.end) 
          })
        )) {
          currentDate = addDays(currentDate, 1);
        }
  
        // Set initial dates - convert to Manila time before formatting
        const manilaCheckIn = convertToManila(currentDate);
        const manilaCheckOut = convertToManila(addDays(currentDate, 1));
        
        checkIn = format(manilaCheckIn, 'yyyy-MM-dd');
        checkOut = format(manilaCheckOut, 'yyyy-MM-dd');
      } catch (error) {
        console.error('Failed to initialize dates:', error);
        // Fallback dates - also convert to Manila time
        const manilaDate = convertToManila(new Date());
        checkIn = format(manilaDate, 'yyyy-MM-dd');
        checkOut = format(convertToManila(addDays(new Date(), 1)), 'yyyy-MM-dd');
      }
    }
  
    onMount(() => {
      initializeDates();
      // Poll every minute for updates
      pollInterval = setInterval(initializeDates, 60000);
      
      return () => {
        if (pollInterval) clearInterval(pollInterval);
      };
    });
  
    async function handleSubmit() {
      bookingData = {
        firstName,
        lastName,
        email,
        phone,
        checkIn,
        checkOut,
        guests,
        specialRequests,
        basePrice,
        extraGuestsFee,
        totalPrice
      };
      
      showPayment = true;
    }
  
    async function handlePaymentMethodSelect(method: string) {
      try {
        isProcessing = true;
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...bookingData,
            paymentMethod: method,
            status: 'pending',
            paymentStatus: 'pending'
          })
        });
  
        if (!response.ok) throw new Error('Booking failed');
        
        const { booking } = await response.json();
        
        // Set payment instructions based on method
        switch (method) {
          case 'bank_transfer':
            paymentInstructions = 'Please check your email for bank transfer details.';
            break;
          case 'gcash':
            paymentInstructions = 'Please check your email for GCash payment details.';
            break;
          case 'cash':
            paymentInstructions = 'Please prepare the exact amount upon check-in.';
            break;
        }
        
        // Show success modal
        showPayment = false;
        showSuccessModal = true;
        
        // Remove the setTimeout and let the user close the modal manually
        // The fields will be reset when they click the close button

      } catch (error) {
        console.error('Booking error:', error);
        alert('There was an error processing your booking. Please try again.');
      } finally {
        isProcessing = false;
      }
    }
  
    function resetFields() {
      firstName = '';
      lastName = '';
      email = '';
      phone = '';
      checkIn = '';
      checkOut = '';
      guests = 2;
      specialRequests = '';
      showPayment = false;
      showSuccessModal = false;
      bookingData = null;
      isProcessing = false;
    }
  </script>
  
  <div class="rounded-lg bg-white p-6 shadow-lg">
    <h2 class="mb-6 text-2xl font-semibold text-gray-800">Book Your Stay</h2>
  
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Name fields -->
        <div class="space-y-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              bind:value={firstName}
              required
              class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
  
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              bind:value={lastName}
              required
              class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>
  
        <!-- Contact fields -->
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              required
              class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
  
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              id="phone"
              bind:value={phone}
              required
              class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>
      </div>
  
      <!-- Booking details -->
      <div class="grid grid-cols-1 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Booking Details</label>
          <div class="relative mt-1">
            <div class="flex flex-col gap-4 sm:flex-row">
              <div>
                <label class="block text-sm font-medium text-gray-700">Check In</label>
                <button
                  type="button"
                  data-datepicker-trigger
                  on:click={() => showCalendar = !showCalendar}
                  class="mt-1 w-full sm:w-40 rounded-md border-gray-300 px-4 py-2.5 text-left shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  {#if checkIn}
                    {format(new Date(checkIn), 'MMM d, yyyy')}
                  {:else}
                    Add date
                  {/if}
                </button>
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700">Check Out</label>
                <button
                  type="button"
                  data-datepicker-trigger
                  on:click={() => showCalendar = !showCalendar}
                  class="mt-1 w-full sm:w-40 rounded-md border-gray-300 px-4 py-2.5 text-left shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  {#if checkOut}
                    {format(new Date(checkOut), 'MMM d, yyyy')}
                  {:else}
                    Add date
                  {/if}
                </button>
              </div>

              <div>
                <label for="guests" class="block text-sm font-medium text-gray-700">Guests</label>
                <div class="relative mt-1">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    id="guests"
                    bind:value={guests}
                    min="1"
                    max="3"
                    required
                    class="w-full sm:w-40 rounded-md border-gray-300 pl-10 pr-3 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>
            </div>
  
            <div class="absolute left-0 w-full">
              <DateRangePicker 
                bind:checkIn 
                bind:checkOut 
                bind:showCalendar
                class_name="date-picker-trigger"
              />
            </div>
          </div>
        </div>
  
      </div>
  
      <div>
        <label for="special-requests" class="block text-sm font-medium text-gray-700">Special Requests</label>
        <textarea
          id="special-requests"
          bind:value={specialRequests}
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        ></textarea>
      </div>
  
      <div class="rounded-md bg-gray-50 p-4">
        <h3 class="text-lg font-semibold text-gray-800">Price Summary</h3>
        <div class="mt-2 space-y-1 text-gray-600">
          <p>Base Rate: ₱{price} × {numberOfNights} nights = ₱{basePrice}</p>
          {#if extraGuestsFee > 0}
            <p>Extra Guests Fee: ₱{extraGuestsFee}</p>
          {/if}
          <p class="mt-2 text-xl font-bold text-gray-900">Total: ₱{totalPrice}</p>
        </div>
      </div>
  
      <button
        type="submit"
        class="w-full rounded-md bg-gray-800 px-4 py-3 text-white transition duration-200 hover:bg-gray-700"
      >
        Confirm Booking
      </button>
    </form>
  </div>
  
  {#if showPayment}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Complete Booking</h2>
          <button 
            on:click={resetFields}
            class="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>
        <PaymentMethodSelect
          amount={bookingData.totalPrice}
          onSelect={handlePaymentMethodSelect}
          {isProcessing}
        />
      </div>
    </div>
  {/if}

  {#if showSuccessModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Booking Successful!</h3>
          <p class="text-sm text-gray-500 mb-4">{paymentInstructions}</p>
          <button
            on:click={resetFields}
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}
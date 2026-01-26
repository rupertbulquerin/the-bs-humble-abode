<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import ChatBot from '$lib/components/ChatBot.svelte';

	/** Set to true to re-enable the chatbot */
	const CHATBOT_ENABLED = false;

	let { children } = $props();
</script>

<Navigation />
<div class="pt-16"> <!-- Add padding-top to account for fixed header -->
	{@render children()}
</div>
{#if CHATBOT_ENABLED}
	<ChatBot />
{/if}

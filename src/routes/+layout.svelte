<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	let { children } = $props();
</script>

<Navigation />
<div class="pt-16"> <!-- Add padding-top to account for fixed header -->
	{@render children()}
</div>

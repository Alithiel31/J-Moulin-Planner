<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, isAuthenticated } from '$lib/stores';
  import { Navbar } from '$lib/components';

  let isInitializing = true;

  onMount(async () => {
    try {
      await auth.init();
    } finally {
      isInitializing = false;
    }
  });

  const handleLogout = async () => {
    try {
      await auth.logout();
      goto('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
</script>

<svelte:window
  on:keydown={(e) => {
    // Keyboard shortcuts
    if (e.key === 'Escape') {
      // Could be used for closing modals, etc.
    }
  }}
/>

<div class="min-h-screen bg-gray-50">
  {#if !isInitializing}
    <Navbar
      user={$auth.user || undefined}
      isLoading={$auth.isLoading}
      onLogout={handleLogout}
      onDashboard={() => goto('/dashboard')}
      onTasks={() => goto('/tasks')}
      onTeams={() => goto('/teams')}
      onEvents={() => goto('/events')}
      onActivity={() => goto('/activity')}
      onSearch={() => goto('/search')}
      onProfile={() => goto('/profile')}
      onSettings={() => goto('/settings')}
      onTimeline={() => goto('/timeline')}
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  {:else}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin text-4xl">⏳</div>
        <p class="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  {/if}
</div>

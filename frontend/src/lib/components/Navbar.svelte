<script lang="ts">
  import type { User } from '../api';
  import Button from './Button.svelte';

  export let user: User | null = null;
  export let isLoading = false;
  export let onLogout: (() => void) | null = null;
  export let onDashboard: (() => void) | null = null;
  export let onTasks: (() => void) | null = null;
  export let onTeams: (() => void) | null = null;
  export let onEvents: (() => void) | null = null;
  export let onActivity: (() => void) | null = null;
  export let onSearch: (() => void) | null = null;
  export let onProfile: (() => void) | null = null;
  export let onSettings: (() => void) | null = null;
  export let onTimeline: (() => void) | null = null;

  let showUserMenu = false;
</script>

<nav class="bg-blue-600 text-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <span class="text-2xl">📋</span>
        <h1 class="text-xl font-bold">J-Moulin Planner</h1>
      </div>

      <!-- Navigation links -->
      {#if user}
        <div class="flex items-center gap-4">
          {#if onDashboard}
            <Button
              variant="secondary"
              size="sm"
              on:click={onDashboard}
              class="hover:bg-blue-700 text-white"
            >
              Dashboard
            </Button>
          {/if}

          {#if onTasks}
            <Button
              variant="secondary"
              size="sm"
              on:click={onTasks}
              class="hover:bg-blue-700 text-white"
            >
              Tasks
            </Button>
          {/if}

          {#if onTeams}
            <Button
              variant="secondary"
              size="sm"
              on:click={onTeams}
              class="hover:bg-blue-700 text-white"
            >
              Teams
            </Button>
          {/if}

          {#if onEvents}
            <Button
              variant="secondary"
              size="sm"
              on:click={onEvents}
              class="hover:bg-blue-700 text-white"
            >
              Events
            </Button>
          {/if}

          {#if onTimeline}
            <Button
              variant="secondary"
              size="sm"
              on:click={onTimeline}
              class="hover:bg-blue-700 text-white"
              title="View task timeline"
            >
              📅 Timeline
            </Button>
          {/if}

          {#if onActivity}
            <Button
              variant="secondary"
              size="sm"
              on:click={onActivity}
              class="hover:bg-blue-700 text-white"
              title="View activity and notifications"
            >
              📋 Activity
            </Button>
          {/if}

          {#if onSearch}
            <Button
              variant="secondary"
              size="sm"
              on:click={onSearch}
              class="hover:bg-blue-700 text-white"
              title="Search tasks and teams"
            >
              🔍 Search
            </Button>
          {/if}

          <!-- User menu -->
          <div class="relative">
            <button
              on:click={() => (showUserMenu = !showUserMenu)}
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span class="text-sm">{user.username}</span>
              <span class="text-xs bg-blue-700 px-2 py-1 rounded capitalize">{user.role}</span>
            </button>

            {#if showUserMenu}
              <div
                class="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-lg py-2 z-50"
              >
                <div class="px-4 py-2 border-b border-gray-200">
                  <p class="text-sm font-semibold">{user.username}</p>
                  <p class="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>

                {#if onProfile}
                  <button
                    on:click={() => {
                      showUserMenu = false;
                      onProfile?.();
                    }}
                    class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    Profile
                  </button>
                {/if}

                {#if onSettings}
                  <button
                    on:click={() => {
                      showUserMenu = false;
                      onSettings?.();
                    }}
                    class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    Settings
                  </button>
                {/if}

                <button
                  on:click={() => {
                    showUserMenu = false;
                    onLogout?.();
                  }}
                  disabled={isLoading}
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 border-t border-gray-200"
                >
                  Logout
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</nav>

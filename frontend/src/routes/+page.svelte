<script lang="ts">
  import { onMount } from 'svelte';

  interface User {
    id: string;
    username: string;
    role: string;
  }

  let user: User | null = null;
  let loading = true;
  let error: string | null = null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  onMount(async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        user = data.data;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch user data';
    } finally {
      loading = false;
    }
  });

  async function logout() {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      user = null;
      window.location.reload();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }
</script>

<main>
  <div class="container">
    <h1>J-Moulin Planner</h1>

    {#if loading}
      <p>Loading...</p>
    {:else if error}
      <div class="error">
        <p>Error: {error}</p>
      </div>
    {:else if user}
      <div class="user-info">
        <p>Welcome, <strong>{user.username}</strong></p>
        <p>Role: <strong>{user.role}</strong></p>
        <button on:click={logout}>Logout</button>
      </div>
    {:else}
      <div class="login-prompt">
        <p>Please log in to continue</p>
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
      Arial, sans-serif;
  }

  .container {
    text-align: center;
    padding: 2rem;
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
  }

  .user-info,
  .login-prompt {
    background: #f5f5f5;
    padding: 2rem;
    border-radius: 8px;
    margin-top: 2rem;
  }

  .error {
    background: #fee;
    color: #c00;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
  }

  button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
    font-size: 1rem;
  }

  button:hover {
    background: #0056b3;
  }

  p {
    margin: 0.5rem 0;
  }
</style>

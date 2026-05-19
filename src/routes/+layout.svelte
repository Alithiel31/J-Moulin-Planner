<script>
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import '../app.css';

  let currentUser = null;

  auth.subscribe(user => {
    currentUser = user;
  });

  onMount(() => {
    // Charger l'utilisateur depuis la session
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          auth.setUser(data.user);
        }
      })
      .catch(() => {});
  });

  import { onMount } from 'svelte';
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
  <slot />
</div>

<style global>
  @import 'tailwindcss/base';
  @import 'tailwindcss/components';
  @import 'tailwindcss/utilities';

  body {
    @apply bg-gradient-to-br from-slate-50 via-white to-indigo-50;
  }
</style>

<script>
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Sparkles, Lock, User } from 'lucide-svelte';

  let currentUser;
  let mode = 'login';
  let username = '';
  let password = '';
  let role = 'teammate';
  let error = '';
  let busy = false;

  auth.subscribe(user => {
    currentUser = user;
    if (user) {
      goto('/dashboard');
    }
  });

  onMount(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          auth.setUser(data.user);
        }
      })
      .catch(() => {});
  });

  async function submit() {
    error = '';
    if (!username || !password) {
      error = 'Tous les champs sont requis';
      return;
    }

    busy = true;
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          ...(mode === 'signup' && { role })
        })
      });

      if (!res.ok) {
        const data = await res.json();
        error = data.error || 'Erreur';
        busy = false;
        return;
      }

      const data = await res.json();
      auth.setUser(data.user);
    } catch (e) {
      error = e.message;
      busy = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
        <Sparkles className="w-7 h-7 text-white" />
      </div>
      <h1 class="text-3xl font-bold text-slate-800">Planificateur</h1>
      <p class="text-slate-500 text-sm mt-1">J.Moulin</p>
    </div>

    <div class="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
      <div class="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg">
        <button
          on:click={() => { mode = 'login'; error = ''; }}
          class={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === 'login' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
          }`}
        >
          Connexion
        </button>
        <button
          on:click={() => { mode = 'signup'; error = ''; }}
          class={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === 'signup' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
          }`}
        >
          Inscription
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="text-xs font-medium text-slate-600 mb-1.5 block">Nom d'utilisateur</label>
          <div class="relative">
            <User class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              bind:value={username}
              on:keydown={e => e.key === 'Enter' && submit()}
              class="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="jacques"
            />
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-slate-600 mb-1.5 block">Mot de passe</label>
          <div class="relative">
            <Lock class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              bind:value={password}
              on:keydown={e => e.key === 'Enter' && submit()}
              class="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        {#if mode === 'signup'}
          <div>
            <label class="text-xs font-medium text-slate-600 mb-1.5 block">Rôle</label>
            <select
              bind:value={role}
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="teammate">Équipier</option>
              <option value="teamlead">Chef d'équipe</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        {/if}

        {#if error}
          <div class="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </div>
        {/if}

        <button
          on:click={submit}
          disabled={busy}
          class="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50"
        >
          {busy ? '...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>
      </div>
    </div>

    <p class="text-center text-xs text-slate-400 mt-6">Planificateur J.Moulin</p>
  </div>
</div>

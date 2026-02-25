<template>
  <div class="login-box">
    <h1>{{ title }}</h1>
    
    <div v-if="useAuthToken && showTokenAtLogin && token" class="login-mode-switcher">
      <button
        type="button"
        :class="`mode-button ${loginMode === 'credentials' ? 'active' : ''}`"
        @click="loginMode = 'credentials'"
      >
        Username & Password
      </button>
      <button
        type="button"
        :class="`mode-button ${loginMode === 'token' ? 'active' : ''}`"
        @click="loginMode = 'token'"
      >
        Use Saved Token
      </button>
    </div>

    <form v-if="loginMode === 'credentials'" @submit.prevent="handleCredentialsLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          :disabled="loading"
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            :disabled="loading"
          />
          <button
            type="button"
            class="password-toggle-btn"
            :disabled="loading"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <EyeOffIcon v-if="showPassword" :width="20" :height="20" />
            <EyeIcon v-else :width="20" :height="20" />
          </button>
        </div>
      </div>
      <button type="submit" :disabled="loading" :style="{ marginTop: '8px' }">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <form v-if="loginMode === 'token' && useAuthToken" @submit.prevent="handleTokenLogin">
      <div class="form-group">
        <label for="token">Auth Token:</label>
        <textarea
          id="token"
          v-model="token"
          required
          :disabled="loading"
          rows="4"
          placeholder="Paste your auth token here..."
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login with Token' }}
      </button>
    </form>

    <div v-if="message" :class="`message ${message.startsWith('✓') ? 'success' : 'error'}`">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import './Login.css'
import { EyeIcon, EyeOffIcon } from '../icon/Icon'

interface Props {
  title?: string
  loginEndpoint?: string
  timeout?: number
  onSuccess?: (data: any) => void
  useAuthToken?: boolean
  authTokenKey?: string
  showTokenAtLogin?: boolean
  autoLoginWithToken?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Login',
  loginEndpoint: 'login',
  timeout: 5000,
  useAuthToken: true,
  authTokenKey: 'authToken',
  showTokenAtLogin: true,
  autoLoginWithToken: true
})

const username = ref('')
const password = ref('')
const token = ref('')
const message = ref('')
const loading = ref(false)
const loginMode = ref<'credentials' | 'token'>('credentials')
const showPassword = ref(false)
const hasAttemptedAutoLogin = ref(false)

onMounted(() => {
  if (props.useAuthToken && typeof window !== 'undefined' && window.localStorage) {
    const savedToken = localStorage.getItem(props.authTokenKey)
    if (savedToken) {
      token.value = savedToken
      
      if (props.autoLoginWithToken && props.onSuccess && !hasAttemptedAutoLogin.value) {
        hasAttemptedAutoLogin.value = true
        loading.value = true
        message.value = '✓ Auto-logging in with saved token...'
        
        setTimeout(() => {
          props.onSuccess?.({ token: token.value })
          loading.value = false
        }, 300)
      }
    }
  }
})

const handleCredentialsLogin = async (e: Event) => {
  e.preventDefault()
  loading.value = true
  message.value = ''

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), props.timeout)

    const response = await fetch(props.loginEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username.value, password: password.value }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json()

    if (data.code === 0) {
      message.value = '✓ Login successful!'

      if (props.useAuthToken && data.data.token && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(props.authTokenKey, data.data.token)
        token.value = data.data.token
      }

      if (props.onSuccess) {
        props.onSuccess(data.data)
      }
    } else {
      message.value = `✗ ${data.message}`
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      message.value = '✗ Server not responding. Please check if the server is running.'
    } else {
      message.value = `✗ Error: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}

const handleTokenLogin = async (e: Event) => {
  e.preventDefault()
  loading.value = true
  message.value = ''

  if (!token.value) {
    message.value = '✗ Please enter an auth token'
    loading.value = false
    return
  }

  try {
    message.value = '✓ Using saved token!'
    
    if (props.onSuccess) {
      props.onSuccess({ token: token.value })
    }
  } catch (error: any) {
    message.value = `✗ Error: ${error.message}`
  } finally {
    loading.value = false
  }
}
</script>

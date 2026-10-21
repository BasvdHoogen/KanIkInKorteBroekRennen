<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useRoute} from 'vue-router'
import {LOCALE_NAMES, SUPPORTED_LOCALES, type Locale} from '@/i18n'
import {localeRoute} from '@/router/localeRoute'

const {t, locale} = useI18n()
const route = useRoute()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const currentLocale = computed<Locale>(() => locale.value as Locale)

// Built from the URL rather than from a remembered location, so switching
// language never promotes a stored location into the address bar.
const options = computed(() =>
    SUPPORTED_LOCALES.map((value) => ({
      value,
      label: LOCALE_NAMES[value],
      to: localeRoute(value, String(route.params.location ?? '')),
      isCurrent: value === currentLocale.value,
    }))
)

function close() {
  open.value = false
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="lang-picker">
    <button
        class="lang-trigger"
        type="button"
        aria-haspopup="menu"
        :aria-expanded="open"
        :aria-label="t('a11y.language')"
        @click="open = !open">
      {{ currentLocale.toUpperCase() }}
      <span class="lang-caret" aria-hidden="true">▾</span>
    </button>

    <ul v-if="open" class="lang-menu" role="menu">
      <li v-for="option in options" :key="option.value" role="none">
        <router-link
            class="lang-option"
            role="menuitem"
            :class="{ 'lang-option-current': option.isCurrent }"
            :to="option.to"
            :lang="option.value"
            :hreflang="option.value"
            :aria-current="option.isCurrent ? 'true' : undefined"
            :data-locale="option.value"
            @click="close">
          {{ option.label }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.lang-picker {
  position: relative;
  flex-shrink: 0;
}

.lang-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 3rem;
  height: 3rem;
  padding: 0 0.7rem;
  border: none;
  border-radius: 999px;
  background: var(--color-background-soft);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: inherit;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.lang-caret {
  font-size: 0.7rem;
  opacity: 0.7;
}

.lang-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.5rem);
  margin: 0;
  padding: 0.3rem;
  list-style: none;
  border-radius: 0.9rem;
  background: var(--color-background-soft);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  min-width: 9rem;
}

.lang-option {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.6rem;
  color: inherit;
  font-size: 0.95rem;
  text-decoration: none;
  white-space: nowrap;
}

.lang-option:hover,
.lang-option:focus-visible {
  background: var(--color-border);
}

.lang-option-current {
  font-weight: 700;
}

.lang-option-current::after {
  content: ' ✓';
  opacity: 0.7;
}
</style>

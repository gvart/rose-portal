<template>
  <q-dialog :model-value="show" @update:model-value="val => $emit('update:show', val)" persistent>
    <q-card class="user-selection-card">
      <UserSelection
        @select-user="handleSelectUser"
        @new-user="handleNewUser"
        @sign-in="handleSignIn"
        @remove-user="handleRemoveUser"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import UserSelection from './UserSelection.vue'
import type { StoredUser } from '@/types/auth'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'select-user': [user: StoredUser]
  'new-user': []
  'sign-in': []
  'remove-user': [user: StoredUser]
}>()

function handleSelectUser(user: StoredUser): void {
  emit('select-user', user)
}

function handleNewUser(): void {
  emit('new-user')
}

function handleSignIn(): void {
  emit('sign-in')
}

function handleRemoveUser(user: StoredUser): void {
  emit('remove-user', user)
}
</script>

<style scoped>
.user-selection-card {
  max-width: 600px;
  width: 100%;
}
</style>

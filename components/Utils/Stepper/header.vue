<template>
  <nav class="flex flex-wrap gap-4 justify-center">
    <template v-for="(header, idx) in headers" :key="header">

      <div v-if="idx !== 0" class="grow flex items-center transition-all">
        <div :class="idx - 1 < actual ? 'w-full':'w-0'" class="h-[2px] rounded-full transition-all duration-300 bg-primary-200/80" />
        <div :class="idx - 1 < actual ? 'w-0':'w-full'" class="h-[2px] rounded-full transition-all duration-300 bg-white/10" />
      </div>

      <div
        class="text-sm transition-all cursor-pointer text-center text-white bg-primary-500 hover:bg-primary-600 py-2 px-4 rounded-full"
        :class="actual === idx ? 'font-semibold':''"
        @click="actual = idx"
      >
        {{ header }}
      </div>

      <template v-if="slots['add'] && idx === headers.length - 1">
        <div v-if="idx !== 0" class="grow flex items-center transition-all">
          <div :class="idx - 1 < actual ? 'w-full':'w-0'" class="h-[2px] rounded-full transition-all duration-300 bg-primary-200/80" />
          <div :class="idx - 1 < actual ? 'w-0':'w-full'" class="h-[2px] rounded-full transition-all duration-300 bg-white/10" />
        </div>

        <slot name="add" />
      </template>
    </template>
  </nav>
</template>

<script setup>

  defineProps({
    headers: {
      type: Array,
      default: [],
    },
  });

  const actual = defineModel('actual', {
    type: Number,
    default: 0,
  });

  const slots = useSlots();

</script>

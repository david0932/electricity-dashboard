<template>
  <div class="gauge-container">
    <svg viewBox="0 0 200 100" class="gauge">
      <path
        d="M10,100 A90,90 0 0,1 190,100"
        fill="none"
        stroke="#444"
        stroke-width="20"
      />
      <path
        :d="gaugePath"
        fill="none"
        stroke="#4dc9f6"
        stroke-width="20"
        stroke-linecap="round"
      />
      <text x="100" y="65" text-anchor="middle" class="gauge-text">
        {{ usage.toFixed(1) }} kW
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  usage: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    default: 10
  }
})

const percent = computed(() => Math.min(props.usage / props.max, 1))

const gaugePath = computed(() => {
  const angle = percent.value * 180
  const rad = (angle * Math.PI) / 180
  const x = 100 + 90 * Math.cos(Math.PI - rad)
  const y = 100 - 90 * Math.sin(rad)
  return `M10,100 A90,90 0 0,1 ${x},${y}`
})
</script>

<style scoped>
.gauge-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.gauge {
  width: 100%;
  max-width: 300px;
  height: auto;
}

.gauge-text {
  fill: #fff;
  font-size: 1.5rem;
  font-weight: bold;
}
</style>

<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup>
import { onMounted, ref, defineProps } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale)

const props = defineProps(['data'])
const canvas = ref(null)

onMounted(() => {
  new Chart(canvas.value, {
    type: 'line',
    data: props.data,
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } }
    }
  })
})
</script>

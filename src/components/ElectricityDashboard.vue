<template>
  <div class="dashboard">
    <div class="card chart">
      <h3>Electricity Monitoring</h3>
      <LineChart :data="lineChartData" />
    </div>
    <div class="card gauge">
      <h3>Current Usage</h3>
      <CurrentUsage :usage="currentUsage" :max="10" />
    </div>
    <div class="card chart">
      <h3>Usage History</h3>
      <BarChart :data="barChartData" />
    </div>
    <div class="card details">
      <h3>Details</h3>
      <ul>
        <li><strong>Voltage:</strong> <span>{{ voltage }} V</span></li>
        <li><strong>Current:</strong> <span>{{ current }} A</span></li>
        <li><strong>Power:</strong> <span>{{ currentUsage }} kW</span></li>
        <li><strong>Power Factor:</strong> <span>{{ powerFactor }}</span></li>
        <li><strong>Frequency:</strong> <span>{{ frequency }} Hz</span></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LineChart from './LineChart.vue'
import BarChart from './BarChart.vue'
import CurrentUsage from './CurrentUsage.vue'
import { useMQTT } from '../services/mqttService'

const currentUsage = ref(0)
const voltage = ref(0)
const current = ref(0)
const frequency = ref(0)
const powerFactor = ref(0)

onMounted(() => {
  useMQTT((data) => {
    currentUsage.value = data.active_power
    voltage.value = data.v
    current.value = data.i
    frequency.value = data.freq
    powerFactor.value = data.pf
    // 也可以更新歷史圖表、時間戳等
  })
})

const lineChartData = {
  labels: ['00:00', '06:00', '12:00', '18:00', '00:00'],
  datasets: [
    {
      label: 'Actual',
      data: [0, 2, 5, 7, 4],
      borderColor: '#4dc9f6',
      tension: 0.4
    },
    {
      label: 'Forecast',
      data: [null, null, null, 7, 5.5, 6],
      borderDash: [5, 5],
      borderColor: '#8ed1fc',
      tension: 0.4
    }
  ]
}

const barChartData = {
  labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
  datasets: [
    {
      label: 'kWh',
      data: [1, 2, 1.5, 2.5, 3, 2, 2.7, 2],
      backgroundColor: '#4dc9f6'
    }
  ]
}
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}

.card {
  background: #1e1e1e;
  border-radius: 10px;
  padding: 1rem;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2em;
}

.chart {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.gauge {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.details ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.details li {
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em;
  padding: 0.5rem;
}

.details li strong {
  margin-right: 1rem;
}
</style>

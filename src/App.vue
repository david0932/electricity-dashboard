<template>
  <ElectricityDashboard/>
</template>

<script>
import ElectricityDashboard from './components/ElectricityDashboard.vue'

export default {
  name: 'App',
  components: {
    ElectricityDashboard
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #1e1e2f;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>

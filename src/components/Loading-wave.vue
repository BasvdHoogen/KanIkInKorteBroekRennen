<script setup lang="ts">

</script>

<template>
  <div>
  <br>
  <br>
  <div class="center">
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
  </div>
  <div>We laden het weerbericht...</div>
  </div>
</template>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.wave {
  width: 10px;
  height: 10px;
  background: linear-gradient(1deg, hsla(160, 100%, 37%, 1), hsla(160, 100%, 37%, 1));
  margin: 10px;
  animation: wave 2s linear infinite;
  border-radius: 20px;
}

.wave:nth-child(2) {
  animation-delay: 0.2s;
}

.wave:nth-child(3) {
  animation-delay: 0.4s;
}

.wave:nth-child(4) {
  animation-delay: 0.6s;
}

.wave:nth-child(5) {
  animation-delay: 0.8s;
}

.wave:nth-child(6) {
  animation-delay: 1s;
}

.wave:nth-child(7) {
  animation-delay: 1.2s;
}

.wave:nth-child(8) {
  animation-delay: 1.4s;
}

.wave:nth-child(9) {
  animation-delay: 1.6s;
}

.wave:nth-child(10) {
  animation-delay: 1.8s;
}

@keyframes wave {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0);
  }
  100% {
    transform: scale(0);
  }
}
</style>
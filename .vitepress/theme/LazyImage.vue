<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  loading: {
    type: String,
    default: 'lazy'
  }
})

const imgRef = ref(null)
const isLoaded = ref(false)
const observer = ref(null)

onMounted(() => {
  if (props.loading === 'lazy' && 'IntersectionObserver' in window) {
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          imgRef.value.src = props.src
          observer.value.unobserve(entry.target)
          isLoaded.value = true
        }
      })
    }, {
      rootMargin: '50px'
    })

    observer.value.observe(imgRef.value)
  } else {
    // 如果不支持 IntersectionObserver，直接加载
    imgRef.value.src = props.src
    isLoaded.value = true
  }
})
</script>

<template>
  <img
    ref="imgRef"
    :alt="alt"
    :loading="loading"
    :class="{ 'img-loaded': isLoaded }"
    loading="lazy"
  />
</template>

<style scoped>
img {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 100%;
  margin: 1rem 0;
}

.img-loaded {
  opacity: 1;
}
</style>

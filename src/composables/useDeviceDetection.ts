import { ref, computed, onMounted } from 'vue'

export function useDeviceDetection() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const width = window.innerWidth

    // Check for mobile devices
    const mobileRegex = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i
    isMobile.value = mobileRegex.test(userAgent) && width < 768

    // Check for tablets (including iPad)
    const tabletRegex = /ipad|android(?!.*mobile)|tablet/i
    isTablet.value = tabletRegex.test(userAgent) || (width >= 768 && width < 1024)

    // Desktop is anything that's not mobile or tablet
    isDesktop.value = !isMobile.value && !isTablet.value

    console.log('[Device Detection]', {
      isMobile: isMobile.value,
      isTablet: isTablet.value,
      isDesktop: isDesktop.value,
      userAgent,
      width
    })
  }

  onMounted(() => {
    detectDevice()
    window.addEventListener('resize', detectDevice)
  })

  const isMobileOrTablet = computed(() => isMobile.value || isTablet.value)

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet
  }
}

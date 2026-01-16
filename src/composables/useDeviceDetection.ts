import { ref, computed, onMounted } from 'vue'

export function useDeviceDetection() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)
  const isPi5 = ref(false)

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const width = window.innerWidth
    const height = window.innerHeight

    // Check for Raspberry Pi 5
    // Pi5 typically runs Chromium on Raspberry Pi OS (ARM architecture)
    const pi5Regex = /raspberry|armv8|aarch64/i
    isPi5.value = pi5Regex.test(userAgent) ||
                  userAgent.includes('raspbian') ||
                  // Additional check: look for specific hardware indicators
                  // Pi5 with 7" touchscreen is 1024x600
                  (navigator.hardwareConcurrency === 4 && width === 1024 && height === 600) ||
                  // Support similar small displays
                  (navigator.hardwareConcurrency === 4 && width >= 1024 && width <= 1280 && height <= 768)

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
      isPi5: isPi5.value,
      userAgent,
      width,
      height
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
    isPi5,
    isMobileOrTablet
  }
}

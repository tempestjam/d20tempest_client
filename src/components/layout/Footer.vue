<template>
  <v-footer :inset="footer.inset" app>
    <span class="px-3">&copy; {{ new Date().getFullYear() }}</span>
  </v-footer>
</template>

<script>
export default {
  name: 'LayoutFooter',
  data() {
    return {
      footer: {
        inset: true
      }
    };
  }
};
</script>

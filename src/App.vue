<template>
  <v-app id="sandbox" :dark="dark">
    <LayoutLeftNav />
    <LayoutToolBar />
    <LayoutContent />
    <LayoutFooter />
  </v-app>
</template>

<script>
import LayoutLeftNav from './components/layout/LeftNav';
import LayoutToolBar from './components/layout/ToolBar';
import LayoutContent from './components/layout/Content';
import LayoutFooter  from './components/layout/Footer';

export default {
  name: 'App',
  components: {
    LayoutLeftNav,
    LayoutToolBar,
    LayoutContent,
    LayoutFooter,
  },
  data() {
    return {
      dark: true,
    };
  }
};
</script>

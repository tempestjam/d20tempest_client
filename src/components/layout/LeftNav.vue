<template>
  <v-navigation-drawer
    v-model="menu.model"
    :clipped="menu.clipped"
    :floating="menu.floating"
    :mini-variant="menu.mini"
    absolute
    overflow
    app
  ></v-navigation-drawer>
</template>

<script>
export default {
  name: 'LayoutLeftNav',
  data() {
    return {
      menu: {
        model: null,
        clipped: true,
        floating: false,
        mini: false
      }
    };
  }
};
</script>

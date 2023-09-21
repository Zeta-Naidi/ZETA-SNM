<template>
  <v-app>
    <v-main>
      <Login v-if="!userInApp"></Login>
      <div v-else>
        <Header></Header>
        <div style="margin: 2rem">
          <router-view></router-view>
        </div>
        <Footer></Footer>
        <confirm ref="confirm"></confirm>
        <dialog-loader ref="dialogLoader"></dialog-loader>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
import Login from "@/components/Login.vue";
import DialogLoader from "./components/layout/DialogLoader.vue";
import Confirm from "@/components/layout/Confirm.vue";

export default {
  name: "App",
  components: {
    Login,
    Header,
    Footer,
    Confirm,
    DialogLoader,
  },
  data: () => ({
    pathsToExcludeHeader: ["/login"],
  }),
  created() {},
  mounted() {
    this.$root.$confirm = this.$refs.confirm.open;
    this.$root.$dialogLoader = this.$refs.dialogLoader;
  },
  computed: {
    userInApp() {
      return !this.pathsToExcludeHeader.includes(this.$route.fullPath);
    },
  },
  watch: {},
};
</script>
<style></style>

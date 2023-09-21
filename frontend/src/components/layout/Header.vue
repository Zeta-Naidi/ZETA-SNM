<template>
  <v-app-bar elevation="1">
    <v-container>
      <!-- Navbar links -->
      <v-btn v-for="(link, index) in routest" :key="index" :to="link.to" flat>
        <!-- Check if link should be displayed based on shouldDisplayLink -->
        <p v-if="shouldDisplayLink(link)">{{ link.text }}</p>
      </v-btn>
    </v-container>
    <v-spacer></v-spacer>

    <v-btn variant="text" @click="logOut()" append-icon="fas fa-power-off">
      LOGOUT
    </v-btn>
  </v-app-bar>
</template>

<script>
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";

export default {
  name: "Header",
  data: () => ({
    routest: [
      {
        text: "Home",
        to: "/dashboard",
      },
      {
        text: "Playlists Private",
        to: "/playlists",
      },
      {
        text: "Playlist Pubbliche",
        to: "/public-playlists",
      },
      {
        text: "Profilo",
        to: "/profile",
      },
      { text: "Users List", to: "/users-list", protected: true },
    ],
    pathsToExcludeHeader: ["/login"],
  }),
  methods: {
    logOut() {
      Cookies.remove("Accesstoken");
      this.$router.push("/login");
    },
    shouldDisplayLink(link) {
      if (link.protected) {
        return this.userAdmin();
      }
      return true;
    },
    userAdmin() {
      const token = Cookies.get("Accesstoken");
      if (token) {
        const decoded = jwt_decode(Cookies.get("Accesstoken"));
        const userEmail = decoded.email;

        if (userEmail === "admin@admin.com") {
          // Admin can access all routes
          return true;
        }
      }

      return false;
    },
  },
};
</script>

<style scoped></style>

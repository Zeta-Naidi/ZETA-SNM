<template>
  <h1>User Profile</h1>
  <v-form @submit.prevent="updateUserData" v-model="form">
    <v-row>
      <v-col>
        <v-text-field
          v-model="userData.email"
          label="Email"
          clearable
          :rules="[rules.required]"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          v-model="userData.username"
          label="Username"
          clearable
          :rules="[rules.required]"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          v-model="userData.password"
          label="Password"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn type="submit" :disabled="!form">Aggiorna</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col style="display: flex; justify-content: flex-end">
        <v-btn color="red" @click="deleteAccount">Elimina Account</v-btn>
      </v-col>
    </v-row>
  </v-form>

  <app-snackbar :response="apiResponseSnackBar" />
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import SnackBarError from "@/components/layout/SnackBarError.vue";

export default {
  components: {
    "app-snackbar": SnackBarError,
  },
  data() {
    return {
      userData: {
        userId: "",
        email: "",
        username: "",
        password: "",
      },
      apiResponseSnackBar: null,
      rules: {
        required: (value) => !!value || "Field is required",
      },
      form: false,
    };
  },
  mounted() {
    const token = Cookies.get("Accesstoken");
    axios
      .get(import.meta.env.VITE_API_BASE_URL + "user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        this.userData.userId = response.data.user._id;
        this.userData.email = response.data.user.email;
        this.userData.username = response.data.user.username;
      })
      .catch((error) => {
        this.apiResponseSnackBar = { status: error.response.status };
      });
  },
  methods: {
    updateUserData() {
      const token = Cookies.get("Accesstoken");
      axios
        .put(
          import.meta.env.VITE_API_BASE_URL +
            `user/update-user/${this.userData.userId}`,
          this.userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          this.apiResponseSnackBar = { status: response.status };
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
    async deleteAccount() {
      const result = await this.$root.$confirm(
        "Sei sicuro di voler eliminare ?",
        "L'utente verrà eliminato definitivamente",
        { color: "primary" },
        null
      );

      if (result) {
        try {
          this.$root.$dialogLoader.start(
            "Eliminazioni in corso...",
            {},
            async () => {
              await this.deleteAccountApi();
            }
          );
        } catch (error) {
          this.apiResponseSnackBar = { status: error.response.status };
        }
      }
    },
    async deleteAccountApi() {
      const token = Cookies.get("Accesstoken");
      axios
        .delete(import.meta.env.VITE_API_BASE_URL + "user/delete-account", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          Cookies.remove("Accesstoken");
          this.$router.push("/login");
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
  },
};
</script>

<style></style>

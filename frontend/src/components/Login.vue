<template>
  <v-container>
    <v-row align-content="center" justify="center">
      <v-col cols="12" sm="10">
        <v-card class="elevation-6 mt-10">
          <v-window v-model="step">
            <v-window-item :value="1">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card-text class="mt-12">
                    <h2 class="text-center">Benvenuto su SNM</h2>
                    <h3 class="text-center">
                      Effettua il login per accedere alla tua musica e alle tue
                      playlist
                    </h3>
                    <v-row align-content="center" justify="center">
                      <v-col cols="12" sm="8">
                        <v-form @submit.prevent="login">
                          <v-text-field
                            v-model="email"
                            label="Email"
                            outlined
                            dense
                            color="blue"
                            class="mt-16"
                          />
                          <v-text-field
                            v-model="password"
                            label="Password"
                            outlined
                            dense
                            color="blue"
                            type="password"
                          />
                          <v-btn type="submit" color="blue" dark block tile
                            >Log in</v-btn
                          >
                        </v-form>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-col>
                <v-col cols="12" md="6" class="blue rounded-bl-xl">
                  <div style="text-align: center; padding: 5vh 0">
                    <v-card-text class="white--text">
                      <h3 class="text-center">
                        Non possiedi ancora un account?
                      </h3>
                      <h6 class="text-center">
                        Cosa aspetti, effettua subilo la registrazione al sito
                      </h6>
                    </v-card-text>
                    <div class="text-center">
                      <v-btn tile outlined dark @click="step++"
                        >REGISTRATI</v-btn
                      >
                    </div>
                  </div>
                </v-col>
              </v-row>
              <br />
              <br />
              <br />
              <br />
            </v-window-item>
            <v-window-item :value="2">
              <v-row>
                <v-col cols="12" md="6" class="blue rounded-br-xl">
                  <div style="text-align: center; padding: 5vh 0">
                    <v-card-text class="white--text">
                      <h2 class="text-center">Possiedi già un Account?</h2>
                      <h3 class="text-center">
                        Allora effettua subito il login
                      </h3>
                    </v-card-text>
                    <div class="text-center">
                      <v-btn tile outlined dark @click="step--">LOG IN</v-btn>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card-text class="mt-12">
                    <h2 class="text-center">Registra un Account</h2>
                    <h3 class="text-center">
                      Crea subito un account inserendo i dati qui in basso
                    </h3>
                    <v-row align="center" justify="center">
                      <v-col cols="12" sm="8">
                        <v-form @submit.prevent="register">
                          <v-text-field
                            v-model="username"
                            label="Username"
                            outlined
                            dense
                            color="blue"
                            class="mt-4"
                          />
                          <v-text-field
                            v-model="email"
                            label="Email"
                            outlined
                            dense
                            color="blue"
                          />
                          <v-text-field
                            v-model="password"
                            label="Password"
                            outlined
                            dense
                            color="blue"
                            type="password"
                          />
                          <v-btn type="submit" color="blue" dark block tile
                            >REGISTRATI</v-btn
                          >
                        </v-form>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-col>
              </v-row>
              <br />
              <br />
              <br />
              <br />
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

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
      username: "",
      email: "",
      password: "",
      step: 1,
      apiResponseSnackBar: null,
    };
  },
  props: {
    source: String,
  },
  methods: {
    login() {
      const userData = {
        email: this.email,
        password: this.password,
      };

      axios
        .post(import.meta.env.VITE_API_BASE_URL + "auth/login", userData)
        .then((response) => {
          const token = response.data.token;
          Cookies.set("Accesstoken", token, { expires: 1 });
          this.$router.push("/dashboard");
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
    register() {
      const userData = {
        username: this.username,
        email: this.email,
        password: this.password,
      };

      axios
        .post(import.meta.env.VITE_API_BASE_URL + "auth/register", userData)
        .then((response) => {
          const token = response.data.token;
          Cookies.set("Accesstoken", token, { expires: 1 });
          this.$router.push("/dashboard");
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
  },
};
</script>

<style scoped></style>

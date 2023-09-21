<template>
  <v-snackbar v-model="show" :color="color">
    {{ message }}

    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="show = false"> Chiudi </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    response: Object,
    timeout: {
      type: Number,
      default: 200,
    },
  },
  watch: {
    response(newResponse) {
      this.showMessage(newResponse);
    },
  },
  methods: {
    showMessage(response) {
      if (response) {
        const status = response.status;
        const statusMessages = {
          200: "Azione eseguita con succetto",
          201: "Azione eseguita con succetto",
          202: "Azione eseguita con succetto",
          203: "Azione eseguita con succetto",
          400: "Richiesta servizio errata.",
          401: "Servizio non autorizzato.",
          403: "Forbidden.",
          404: "Errore con le credenziali",
          405: "Method Not Allowed.",
          500: "Errore del server.  ",
          501: "Not Implemented.",
          502: "Bad Gateway.",
          503: "Servizio non raggiungibile.",
        };

        // Check if the user provided a custom message
        if (response.message) {
          this.message = response.message;
        } else {
          // Fallback to status-based messages
          this.message = statusMessages[status] || "Errore sconosciuto";
        }

        this.color = status >= 200 && status < 300 ? "success" : "error";
        this.show = true;
      }
    },
  },
  data() {
    return {
      show: false,
      message: "",
      color: "",
    };
  },
};
</script>

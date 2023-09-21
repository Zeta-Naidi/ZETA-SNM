<template>
  <div>
    <!-- Using hide-overlay below allows for clicking while progress showing -->
    <v-dialog
        v-model="dialog"
        persistent
        :width="options.width"
        v-bind:style="{ zIndex: options.zIndex }"
    >
      <v-card :color="options.color" dark>
        <v-card-text>
          {{ message }}
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    message: null,
    options: {
      color: 'primary',
      width: 290,
      zIndex: 200
    }
  }),
  methods: {
    show(message, options) {
      this.dialog = true;
      this.message = message;
      this.options = Object.assign(this.options, options);
    },
    hide() {
      this.dialog = false;
    },
    start(message, options, callback) {
      this.show(message, options);
      if (typeof callback === 'function') {
        callback()
            .then(this.hide)
            .catch(error => {
              this.hide();
            });
      }
    },
    stop() {
      this.hide();
    }
  }
};
</script>

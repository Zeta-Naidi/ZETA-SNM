<template>
  <h2>RISULTATI RICERCA</h2>
  <v-row>
    <v-col>
      <v-text-field
        v-model="query"
        hide-details
        placeholder="Search name..."
        class="ma-2"
        density="compact"
      ></v-text-field>
    </v-col>
    <v-col>
      <v-select
        label="Search type..."
        v-model="type"
        :items="['artist', 'album', 'playlist', 'track']"
        class="ma-2"
        density="compact"
      ></v-select>
    </v-col>
  </v-row>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items-length="totalItems"
    :items="serverItems"
    :loading="loading"
    :search="search"
    class="elevation-1"
    item-value="name"
    v-model="selectedItems"
    @update:options="loadItems"
  >
    <template v-slot:item.img="{ item }">
      <v-img
        v-if="item.selectable.images"
        :src="item.selectable.images[0].url"
        width="50"
      ></v-img>

      <v-img
        v-if="item.selectable.type === 'track' && item.selectable.album.images"
        :src="item.selectable.album.images[0].url"
        width="50"
      ></v-img>
    </template>

    <template v-slot:item.details="{ item }">
      <p v-if="item.selectable.type === 'artist'">
        {{ item.selectable.genres.join(", ") }}
      </p>

      <p v-else-if="item.selectable.type === 'album'">
        <v-chip>{{ item.selectable.total_tracks }}</v-chip>

        <v-chip>{{ item.selectable.release_date }}</v-chip>
      </p>

      <p v-else-if="item.selectable.type === 'playlist'">
        {{ item.selectable.description }}
      </p>

      <p v-else-if="item.selectable.type === 'track'">
        <v-chip v-for="elem in item.selectable.artists">{{ elem.name }}</v-chip>

        <v-chip>{{ item.selectable.album.release_date }}</v-chip>

        <v-chip>{{ formattedDuration(item.selectable.duration_ms) }}</v-chip>
      </p>
    </template>

    <template v-slot:no-data>
      <v-btn color="primary" @click="resetTableElemets">Reset</v-btn>
    </template>
  </v-data-table-server>

  <app-snackbar :response="apiResponseSnackBar" />
</template>

<script>
import axios from "axios";
import SnackBarError from "@/components/layout/SnackBarError.vue";

export default {
  components: {
    "app-snackbar": SnackBarError,
  },
  data() {
    return {
      apiResponseSnackBar: null,
      query: "",
      type: "artist",
      selectedItems: [],
      result: [],
      inputData: {
        query: "a",
        type: "artist",
        limit: "10",
      },
      itemsPerPage: 10,
      headers: [
        {
          title: "Copetina",
          key: "img",
          align: "start",
          width: 5,
          sortable: false,
        },
        {
          title: "Name",
          align: "start",
          key: "name",
        },
        { title: "Details", key: "details", align: "start", sortable: false },
      ],
      search: "",
      totalItems: "",
      serverItems: [],
      loading: false,
    };
  },
  methods: {
    logout() {
      this.$router.replace({ name: "login" });
    },
    resetTableElemets() {
      this.loadItems({
        page: 1,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.sortBy,
      });
    },
    async callAPI({ page, itemsPerPage, sortBy }) {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;

      try {
        const response = await axios.post(
          import.meta.env.VITE_API_BASE_URL + "user/music",
          this.inputData
        );
        this.items = response.data[this.inputData.type + "s"].items;
      } catch (error) {
        this.apiResponseSnackBar = { status: error.response.status };
      }

      if (sortBy.length) {
        const sortKey = sortBy[0].key;
        const sortOrder = sortBy[0].order;
        this.items.sort((a, b) => {
          const aValue = a[sortKey];
          const bValue = b[sortKey];

          if (typeof aValue === "string") {
            return sortOrder === "desc"
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }
        });
      }

      const paginated = this.items.slice(start, end);

      return {
        items: paginated,
        total: this.items.length,
      };
    },
    async loadItems({ page, itemsPerPage, sortBy }) {
      this.loading = true;
      try {
        const { items, total } = await this.callAPI({
          page,
          itemsPerPage,
          sortBy,
          search: { query: this.query, type: this.type },
        });
        this.serverItems = items;
        this.totalItems = total;
        this.loading = false;
      } catch (error) {
        this.apiResponseSnackBar = { status: error.response.status };
      }
    },
    formattedDuration(duration_ms) {
      const totalSeconds = Math.floor(duration_ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },
  },
  watch: {
    query() {
      this.inputData.query = this.query;
      this.search = String(Date.now());
    },
    type() {
      this.inputData.type = this.type;
      this.search = String(Date.now());
    },
  },
};
</script>

<style></style>

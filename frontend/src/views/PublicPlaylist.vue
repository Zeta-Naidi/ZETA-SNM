<template>
  <h1>SHARED PLAYLISTS</h1>
  <p>LISTA CON LE PLAYLIST PUBBLICHE</p>

  <v-row>
    <v-col>
      <v-text-field
        v-model="filterSearch"
        hide-details
        label="Search by username, title, description, tags and track namme ..."
        class="ma-2"
        density="compact"
      ></v-text-field>
    </v-col>
  </v-row>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:expanded="expanded"
    :headers="headers"
    :items-length="totalItems"
    :items="serverItems"
    :loading="loading"
    :search="search"
    class="elevation-1"
    show-expand
    item-value="_id"
    @update:options="loadItems"
  >
    <template v-slot:item.user="{ item }">
      {{ item.selectable.userInfo.username }}
    </template>

    <template v-slot:item.tags="{ item }">
      <v-chip v-for="tag in item.selectable.tags">{{ tag }}</v-chip>
    </template>

    <template v-slot:item.tracks="{ item }">
      {{ item.selectable.tracks.length }}
    </template>

    <template v-slot:expanded-row="{ columns, item }">
      <tr v-for="track in item.selectable.tracks">
        <td :colspan="columns.length">
          <v-chip style="margin: 1rem" label>Name: {{ track.name }}</v-chip>
          <v-chip style="margin: 1rem" label
            >Duration: {{ formattedDuration(track.duration_ms) }}</v-chip
          >

          <v-chip style="margin: 1rem" label v-for="artist in track.artists"
            >Artist: {{ artist.name }}</v-chip
          >
        </td>
      </tr>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        v-if="checkIfToShowAddButton(item.selectable)"
        color="green"
        @click="AddPlaylistToUser(item.selectable)"
        >fas fa-plus</v-icon
      >
    </template>

    <template v-slot:no-data>
      <v-btn color="primary" @click="resetTableElemets">Reset</v-btn>
    </template>
  </v-data-table-server>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

export default {
  data() {
    return {
      expanded: [],
      singleExpand: false,
      selectedItems: [],
      result: [],
      itemsPerPage: 10,
      headers: [
        { title: "Utente", key: "user", align: "start" },
        { title: "Titolo", key: "title", align: "start" },
        { title: "Descrizione", align: "center", key: "description" },
        { title: "Tags", key: "tags", align: "center" },
        { title: "N. Tracks", key: "tracks", align: "center" },
        { title: "", key: "actions", align: "center" },
        { title: "", key: "data-table-expand" },
      ],
      filterSearch: "",
      search: "",
      totalItems: "",
      serverItems: [],
      loading: false,
      playlistData: null,
      currentUserEmail: "",
      currentUserId: "",
    };
  },
  mounted() {
    const token = Cookies.get("Accesstoken");
    axios
      .get(import.meta.env.VITE_API_BASE_URL + "user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.currentUserEmail = response.data.user.email;
        this.currentUserId = response.data.user._id;
      })
      .catch((error) => {
        this.apiResponseSnackBar = { status: error.response.status };
      });
  },
  methods: {
    resetTableElemets() {
      this.loadItems({
        page: 1,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.sortBy,
      });
    },
    resetTableElemets() {
      this.loadItems({
        page: 1,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.sortBy,
      });
    },
    async callAPI({ page, itemsPerPage, sortBy, search }) {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const token = Cookies.get("Accesstoken");

      try {
        const response = await axios.get(
          import.meta.env.VITE_API_BASE_URL + "user/public-playlists",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.items = response.data.filter((item) => {
          if (!search) {
            return true;
          }
          const searchText = search.filterSearch.toLowerCase().trim();
          if (!searchText) {
            return true;
          }

          if (
            item.userInfo.username.toLowerCase().includes(searchText) ||
            item.title.toLowerCase().includes(searchText) ||
            item.description.toLowerCase().includes(searchText) ||
            item.tags.some((tag) => tag.toLowerCase().includes(searchText)) ||
            item.tracks.some((track) =>
              track.name.toLowerCase().includes(searchText)
            )
          ) {
            return true;
          }
        });
      } catch (error) {
        console.log(error);
        this.apiResponseSnackBar = { status: error.response.status };
      }

      if (sortBy.length) {
        const sortKey = sortBy[0].key;
        const sortOrder = sortBy[0].order;
        this.items.sort((a, b) => {
          const aValue = a[sortKey];
          const bValue = b[sortKey];

          if (typeof aValue === "string") {
            // String comparison for 'type' property
            return sortOrder === "desc"
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          } else {
            // Numeric comparison for other properties
            return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
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
          search: { filterSearch: this.filterSearch },
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
    AddPlaylistToUser(item) {
      const token = Cookies.get("Accesstoken");
      item["userId"] = this.currentUserId;
      axios
        .post(
          import.meta.env.VITE_API_BASE_URL +
            "user/add-public-playlist-to-user",
          item,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        .then((response) => {
          const page = 1;
          const itemsPerPage = this.itemsPerPage;
          const sortBy = [];

          this.loadItems({ page, itemsPerPage, sortBy });
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
    checkIfToShowAddButton(item) {
      if (item.userInfo.email !== this.currentUserEmail) {
        for (const serverItem of this.serverItems) {
          if (serverItem.userId === this.currentUserId) {
            if (
              serverItem.title === item.title &&
              serverItem.description === item.description &&
              serverItem.tracks.length === item.tracks.length
            ) {
              return false;
            }
          }
        }
        return true;
      }
      return false;
    },
  },
  watch: {
    filterSearch() {
      this.search = String(Date.now());
    },
  },
};
</script>

<style></style>

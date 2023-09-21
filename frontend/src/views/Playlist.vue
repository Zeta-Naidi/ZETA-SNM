<template>
  <h1>User Playlists</h1>
  <p>LISTA CON LE PLAYLIST DELL'UTENTE</p>
  <v-btn @click="openDialog(false, null)">ADD PLAYLSIT</v-btn>

  <add-playlsit
    ref="playlistDialog"
    :initialPlaylist="playlistData"
    @dialogClosed="handleDialogClose"
  ></add-playlsit>

  <v-row>
    <v-col>
      <v-text-field
        v-model="filterSearch"
        hide-details
        label="Search by title, description, tags and track name ..."
        class="ma-2"
        density="compact"
      ></v-text-field>
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
    v-model:expanded="expanded"
    show-expand
    item-value="_id"
    @update:options="loadItems"
  >
    <template v-slot:item.tags="{ item }">
      <v-chip v-for="tag in item.selectable.tags">{{ tag }}</v-chip>
    </template>

    <template v-slot:item.tracks="{ item }">
      {{ item.selectable.tracks.length }}
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        style="margin-right: 1vh"
        @click="openDialog(true, item)"
        color="primary"
        >fas fa-edit</v-icon
      >
      <v-icon size="small" @click="deletePlaylist(item.selectable)" color="red"
        >fas fa-trash</v-icon
      >
    </template>

    <template v-slot:item.shared="{ item }">
      <v-icon
        v-if="item.selectable.shared"
        size="small"
        @click="removePlaylistFromShared(item.selectable)"
        color="green"
        >fas fa-check</v-icon
      >

      <v-icon v-else size="small" @click="sharePlaylist(item.selectable)"
        >fas fa-share</v-icon
      >
    </template>

    <template v-slot:expanded-row="{ columns, item }">
      <tr v-for="track in item.selectable.tracks">
        <td :colspan="columns.length">
          <v-chip style="margin: 1rem" label>Name: {{ track.name }}</v-chip>

          <v-chip style="margin: 1rem" label
            >Relase Date: {{ track.album.release_date }}</v-chip
          >

          <v-chip style="margin: 1rem" label
            >Duration: {{ formattedDuration(track.duration_ms) }}</v-chip
          >

          <v-chip style="margin: 1rem" label v-for="artist in track.artists"
            >Artist: {{ artist.name }}</v-chip
          >
        </td>
      </tr>
    </template>

    <template v-slot:no-data>
      <v-btn color="primary" @click="resetTableElemets">Reset</v-btn>
    </template>
  </v-data-table-server>

  <app-snackbar :response="apiResponseSnackBar" />
</template>

<script>
import axios from "axios";
import AddPlaylsit from "@/components/AddPlaylist.vue";
import Cookies from "js-cookie";
import SnackBarError from "@/components/layout/SnackBarError.vue";

export default {
  components: {
    "add-playlsit": AddPlaylsit,
    "app-snackbar": SnackBarError,
  },
  data() {
    return {
      expanded: [],
      singleExpand: false,
      apiResponseSnackBar: null,
      filterSearch: "",
      selectedItems: [],
      result: [],
      itemsPerPage: 10,
      headers: [
        { title: "Title", key: "title", align: "start" },
        { title: "Description", align: "center", key: "description" },
        { title: "Tags", key: "tags", align: "center", sortable: false },
        { title: "N. Tracks", key: "tracks", align: "end", sortable: false },
        { title: "Shared", key: "shared", align: "end", sortable: false },
        { title: "Actions", key: "actions", align: "end", sortable: false },
      ],
      search: "",
      totalItems: "",
      serverItems: [],
      loading: false,
      dialog: false,
      playlistData: null,
    };
  },
  methods: {
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
          import.meta.env.VITE_API_BASE_URL + "user/users-playlists",
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
          search: { filterSearch: this.filterSearch },
        });

        this.serverItems = items;
        this.totalItems = total;
        this.loading = false;
      } catch (error) {
        this.apiResponseSnackBar = { status: error.response.status };
      }
    },
    handleDialogClose() {
      const page = 1;
      const itemsPerPage = this.itemsPerPage;
      const sortBy = [];

      this.loadItems({ page, itemsPerPage, sortBy });
    },
    openDialog(isEditMode, item) {
      if (isEditMode) {
        this.playlistData = item.selectable;
      } else {
        this.playlistData = {
          title: "",
          description: "",
          tags: [],
          tracks: [],
        };
      }

      this.$refs.playlistDialog.openDialog();
    },
    async deletePlaylist(item) {
      const result = await this.$root.$confirm(
        "Sei sicuro di voler eliminare ?",
        "L'utente verrà eliminato definitivamente",
        { color: "primary" },
        item._id
      );

      if (result) {
        try {
          this.$root.$dialogLoader.start(
            "Eliminazioni in corso...",
            {},
            async () => {
              await this.deletePlaylistApi(item._id);
            }
          );
        } catch (error) {
          this.apiResponseSnackBar = { status: error.response.status };
        }
      }
    },
    async deletePlaylistApi(playlistId) {
      const token = Cookies.get("Accesstoken");

      axios
        .delete(
          import.meta.env.VITE_API_BASE_URL +
            `user/delete-users-playlists/${playlistId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          this.apiResponseSnackBar = { status: response.status };

          const page = 1;
          const itemsPerPage = this.itemsPerPage;
          const sortBy = [];

          this.loadItems({ page, itemsPerPage, sortBy });
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
    sharePlaylist(item) {
      const token = Cookies.get("Accesstoken");
      axios
        .post(
          import.meta.env.VITE_API_BASE_URL + "user/public-playlists",
          item,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          this.apiResponseSnackBar = { status: response.status };

          const page = 1;
          const itemsPerPage = this.itemsPerPage;
          const sortBy = [];

          this.loadItems({ page, itemsPerPage, sortBy });
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
    removePlaylistFromShared(item) {
      const token = Cookies.get("Accesstoken");
      axios
        .post(
          import.meta.env.VITE_API_BASE_URL + "user/public-playlists",
          item,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          this.apiResponseSnackBar = { status: response.status };

          const page = 1;
          const itemsPerPage = this.itemsPerPage;
          const sortBy = [];

          this.loadItems({ page, itemsPerPage, sortBy });
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
    formattedDuration(duration_ms) {
      const totalSeconds = Math.floor(duration_ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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

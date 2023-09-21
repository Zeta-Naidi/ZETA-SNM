<template>
  <v-dialog v-model="dialogVisible" persistent max-width="120vh">
    <v-card>
      <v-card-title v-if="isEditMode"> Update the Playlist </v-card-title>
      <v-card-title v-else> Create a new Playlist </v-card-title>
      <v-card-text>
        <v-row>
          <v-col style="padding: 1px">
            <v-text-field
              v-model="newPlaylist.title"
              label="Playlist Title"
              class="ma-2"
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col style="padding: 1px">
            <v-text-field
              v-model="tagInput"
              @keydown.enter="addTag()"
              label="Aggiungere un elemento e premere Invio"
              class="ma-2"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col style="padding: 1px">
            <v-select
              v-model="newPlaylist.tags"
              :items="newPlaylist.tags"
              label="Elementi aggiunti"
              multiple
              class="ma-2"
              hide-details
            >
              <template v-slot:selection="{ item, index }">
                <v-chip color="primary">
                  <template v-slot:append>
                    <v-icon @click.stop="removeTag(item, index)">
                      fas fa-xmark
                    </v-icon>
                  </template>
                  {{ item.title }}
                </v-chip>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col style="padding: 1px">
            <v-text-field
              v-model="newPlaylist.description"
              hide-details
              label="Playlist Description"
              class="ma-2"
            ></v-text-field>
          </v-col>
        </v-row>
        <br />

        <v-list
          v-if="newPlaylist.tracks"
          style="max-height: 10rem; overflow: auto"
        >
          <v-list-subheader>SELECTED TRACKS</v-list-subheader>

          <v-list-item v-for="track in newPlaylist.tracks">
            <template v-slot:prepend>
              <v-icon @click="removeTrackFromSelection(track)"
                >fas fa-xmark</v-icon
              >
            </template>

            <v-list-item-title v-text="track.name"></v-list-item-title>

            <template v-slot:append>
              <v-chip style="margin: 1rem" label
                >Duration: {{ formattedDuration(track.duration_ms) }}</v-chip
              >

              <v-chip style="margin: 1rem" label v-for="artist in track.artists"
                >Artist: {{ artist.name }}</v-chip
              >
            </template>
          </v-list-item>
        </v-list>

        <br />
        <v-row>
          <v-col>
            <v-text-field
              v-model="query"
              hide-details
              placeholder="Search title, artist..."
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
          item-value="id"
          v-model="newPlaylist.tracks"
          show-select
          return-object=""
          @update:options="loadItems"
        >
          <template v-slot:item.img="{ item }">
            <v-img
              v-if="
                item.selectable.type === 'track' && item.selectable.album.images
              "
              :src="item.selectable.album.images[0].url"
              width="50"
            ></v-img>
          </template>

          <template v-slot:item.artists="{ item }">
            <v-chip v-for="artist in item.selectable.artists">{{
              artist.name
            }}</v-chip>
          </template>

          <template v-slot:item.date="{ item }">
            {{ item.selectable.album.release_date }}
          </template>

          <template v-slot:no-data>
            <v-btn color="primary" @click="resetTableElemets">Reset</v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>

      <v-card-actions>
        <v-row>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn
              variant="outlined"
              color="primary"
              @click="dialogVisible = false"
              >Close</v-btn
            >
          </v-col>
          <v-col>
            <v-btn variant="tonal" color="primary" @click="savePlaylist"
              >Save</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

export default {
  props: {
    initialPlaylist: Object,
  },
  data() {
    return {
      query: "",
      selectedItems: [],
      result: [],
      inputData: {
        query: "a",
        type: "track",
        limit: "3",
      },
      itemsPerPage: 3,
      headers: [
        { title: "Cover", key: "img", align: "start", width: 5 },
        {
          title: "Title",
          align: "start",
          key: "name",
        },
        { title: "Artists", key: "artists", align: "start", sortable: false },
        { title: "Date", key: "date", align: "start", sortable: false },
      ],
      search: "",
      totalItems: "",
      serverItems: [],
      loading: false,
      dialogVisible: false,
      newPlaylist: {
        title: "",
        description: "",
        tags: [],
        tracks: [],
      },
      tagInput: "",
      isEditMode: false, // Added to determine if in edit mode or create mode
    };
  },
  methods: {
    addTag() {
      if (this.tagInput.trim() !== "") {
        this.newPlaylist.tags.push(this.tagInput);
        this.tagInput = ""; // Clear the input field
      }
    },
    removeTag(index) {
      this.newPlaylist.tags.splice(index, 1);
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
        console.error("Error fetching data:", error);
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
        console.error(error);
      }
    },
    openDialog() {
      this.dialogVisible = true;
    },
    savePlaylist() {
      const token = Cookies.get("Accesstoken");

      const endpoint = this.isEditMode
        ? import.meta.env.VITE_API_BASE_URL +
          `user/update-users-playlists/${this.newPlaylist._id}`
        : import.meta.env.VITE_API_BASE_URL + "user/users-playlists";

      const requestMethod = this.isEditMode ? "put" : "post";

      axios[requestMethod](endpoint, this.newPlaylist, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          this.dialogVisible = false;
          this.$emit("dialogClosed");
        })
        .catch((error) => {});
      //console.log(this.newPlaylist);
    },
    formattedDuration(duration_ms) {
      const totalSeconds = Math.floor(duration_ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },
    removeTrackFromSelection(track) {
      const indexToRemove = this.newPlaylist.tracks.findIndex(
        (t) => t.id === track.id
      );

      if (indexToRemove !== -1) {
        this.newPlaylist.tracks.splice(indexToRemove, 1);
      }
    },
  },
  watch: {
    query() {
      this.inputData.query = this.query;
      this.search = String(Date.now());
    },
    dialogVisible() {
      if (
        this.initialPlaylist &&
        (this.initialPlaylist.title ||
          this.initialPlaylist.description ||
          this.initialPlaylist.tags.length ||
          this.initialPlaylist.tracks.length)
      ) {
        // If initialPlaylist prop is provided, set it to newPlaylist
        this.newPlaylist = { ...this.initialPlaylist };
        this.isEditMode = true; // Set to true when editing an existing playlist
      } else {
        this.newPlaylist = {
          title: "",
          description: "",
          tags: [],
          tracks: [],
        };
        this.tagInput = "";
      }
    },
  },
};
</script>

<style></style>

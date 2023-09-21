<template>
  <h1>Users List</h1>

  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items-length="totalItems"
    :items="serverItems"
    :loading="loading"
    :search="search"
    class="elevation-1"
    item-value="name"
    @update:options="loadItems"
  >
  </v-data-table-server>

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
      apiResponseSnackBar: null,
      users: [],
      selectedItems: [],
      itemsPerPage: 10,
      headers: [
        { title: "ID", key: "_id", align: "start" },
        {
          title: "Username",
          align: "start",
          key: "username",
        },
        { title: "Email", key: "email", align: "end" },
      ],
      search: "",
      totalItems: "",
      serverItems: [],
      loading: false,
    };
  },
  methods: {
    async callAPI({ page, itemsPerPage, sortBy }) {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const token = Cookies.get("Accesstoken");

      try {
        const response = await axios.get(
          import.meta.env.VITE_API_BASE_URL + "user/users-list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          this.inputData
        );
        this.items = response.data;
      } catch (error) {
        this.apiResponseSnackBar = { status: error.response.status };
        //console.error("Error fetching data:", error);
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
            // Numeric comparison for other properties (e.g., '_id')
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
          search: { query: this.query, type: this.type },
        });
        this.serverItems = items;
        this.totalItems = total;
        this.loading = false;
      } catch (error) {
        this.apiResponseSnackBar = { status: error.response.status };
      }
    },
    musicMethod() {
      const token = Cookies.get("Accesstoken"); // Recupera il token JWT dai Cookies
      axios
        .get(
          import.meta.env.VITE_API_BASE_URL + "user/users-list",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Includi il token nell'header "Authorization"
            },
          },
          this.inputData
        )
        .then((response) => {
          this.users = response.data;
        })
        .catch((error) => {
          this.apiResponseSnackBar = { status: error.response.status };
        });
    },
  },
};
</script>

<style></style>

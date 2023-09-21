import { createRouter, createWebHistory } from "vue-router";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";

const routes = [
  //----------------------------HOME----------------------------
  {
    path: "/",
    redirect: "/dashboard",
  },
  //----------------------------LOGIN----------------------------
  {
    path: "/login",
    component: () => import("../components/Login.vue"),
  },
  //----------------------------PROFILO----------------------------
  {
    path: "/users-list",
    component: () => import("../views/UsersList.vue"),
    meta: { requiresAuthAdmin: true },
  },
  //----------------------------PROFILO----------------------------
  {
    path: "/profile",
    component: () => import("../views/Profile.vue"),
  },
  //----------------------------DASHBOARD----------------------------
  {
    path: "/dashboard",
    component: () => import("../components/Dashboard.vue"),
  },
  //----------------------------PLAYLISTS----------------------------
  {
    path: "/playlists",
    component: () => import("../views/Playlist.vue"),
    meta: { requiresAuthAdmin: true },
  },
  {
    path: "/public-playlists",
    component: () => import("../views/PublicPlaylist.vue"),
    meta: { requiresAuthAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(/*process.env.BASE_URL*/),
  routes,
});

// Add a global navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = Cookies.get("Accesstoken");

  try {
    if (!isAuthenticated && to.path !== "/login") {
      // User is not logged in and trying to access a route other than /login
      next("/login");
    } else if (isAuthenticated) {
      const decoded = jwt_decode(Cookies.get("Accesstoken"));
      const userEmail = decoded.email;

      if (userEmail === "admin@admin.com") {
        // Admin can access all routes
        next();
      } else if (to.path === "/users-list") {
        // Non-admin trying to access /users-list, redirect to dashboard
        next("/dashboard");
      } else {
        // Non-admin can access other routes
        next();
      }
    } else {
      // User is not logged in and trying to access /login
      next();
    }
  } catch (error) {
    console.log(error);
    next("/login");
  }
});
export default router;

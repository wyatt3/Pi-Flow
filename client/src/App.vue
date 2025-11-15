<template>
  <div class="min-h-screen bg-gray-100 text-gray-900">
    <!-- NAVBAR -->
    <header class="bg-white shadow mb-6">
      <div class="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">Relay Controller</h1>
        <div>test</div>

        <!-- Navigation -->
        <nav class="flex gap-4"></nav>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="max-w-5xl mx-auto px-4"></main>
  </div>
</template>

<script>
import { io } from "socket.io-client";
export default {
  name: "App",

  data() {
    return {
      relays: [],
      schedules: [],
      connected: false,
      socket: null,
    };
  },

  methods: {
    connectWs() {
      this.socket = io("http://localhost:8080");

      this.socket.on("connect", () => {
        console.log("Connected:", this.socket.id);
      });

      this.socket.on("relays:update", (relays) => {
        console.log("Relays updated:", relays);
      });

      this.socket.on("schedules:update", (schedules) => {
        console.log("Schedules updated:", schedules);
      });
    },
    getRelays() {
      axios.get("/api/relays").then((response) => {
        this.relays = response.data;
      });
    },
  },

  mounted() {
    this.getRelays();
    this.connectWs();
  },

  beforeUnmount() {
    if (this.socket) this.socket.close();
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
</style>

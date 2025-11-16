<template>
  <div>
    <h1 class="text-xl font-bold">Zones</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>GPIO Pin</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="relay in relays" :key="relay.id">
          <td>{{ relay.name }}</td>
          <td>{{ relay.gpio_pin }}</td>
          <td>
            <button
              @click="toggleRelayActive(relay)"
              class="btn"
              :class="relay.active == 1 ? 'btn-danger' : 'btn-success'"
              v-text="relay.active == 1 ? 'OFF' : 'ON'"
            ></button>
          </td>
          <td>
            <button class="btn btn-danger bi bi-trash" @click="deleteRelay(relay)"></button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="d-flex gap-2">
      <input
        v-model="newRelayName"
        type="text"
        placeholder="Relay Name"
        class="border border-gray-300 rounded px-2 py-1"
      />
      <input
        v-model="newRelayGpioPin"
        type="number"
        placeholder="GPIO Pin"
        class="border border-gray-300 rounded px-2 py-1"
      />
      <button @click="addRelay" class="btn btn-primary">Add Relay</button>
    </div>

    <!-- Navigation -->
    <nav class="flex gap-4"></nav>

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
      newRelayName: "",
      newRelayGpioPin: null,
    };
  },

  methods: {
    connectWs() {
      this.socket = io("http://localhost:8080");

      this.socket.on("relays:update", (relays) => {
        this.relays = relays;
      });

      this.socket.on("schedules:update", (schedules) => {
        this.schedules = schedules;
      });
    },
    getRelays() {
      axios.get("/api/relays").then((response) => {
        this.relays = response.data;
      });
    },
    addRelay() {
      axios.post("/api/relays", {
        name: this.newRelayName,
        gpio_pin: this.newRelayGpioPin,
      });
    },
    toggleRelayActive(relay) {
      relay.active = relay.active == 1 ? 0 : 1;
      axios.post(`/api/relays/${relay.id}`, relay);
    },
    deleteRelay(relay) {
      axios.delete(`/api/relays/${relay.id}`);
    },
  },

  mounted() {
    this.connectWs();
    this.getRelays();
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

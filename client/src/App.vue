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
      this.socket = new WebSocket("ws://localhost:8080");

      this.socket.onopen = () => {
        this.connected = true;
      };

      this.socket.onclose = () => {
        this.connected = false;

        // Attempt reconnect after 2 seconds
        setTimeout(() => this.connectWs(), 2000);
      };

      this.socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);

          if (data.type === "relays") {
            this.relays = data.relays;
          }

          if (data.type === "schedules") {
            this.schedules = data.schedules;
          }
        } catch (e) {
          console.error("Invalid WS message", e);
        }
      };
    },
    getRelays() {
      axios.get("/api/relays").then((response) => {
        this.relays = response.data;
      });
    },
  },

  mounted() {
    this.getRelays();
    // this.connectWs();
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

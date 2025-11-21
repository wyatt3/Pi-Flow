<template>
  <div>
    <h1 class="text-xl font-bold">Zones</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>GPIO Pin</th>
          <th>Schedule</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="relay in relays" :key="relay.id">
          <td>{{ relay.name }}</td>
          <td>{{ relay.gpio_pin }}</td>
          <td>
            <button class="btn btn-info" @click="selectedRelay = relay"><i class="bi bi-clock"></i></button>
          </td>
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

    <modal :open="selectedRelay" @toggle="selectedRelay = null">
      <h1>Schedules</h1>
      <div class="schedule" v-for="schedule in selectedRelay.schedules" :key="schedule.id">
        <div class="d-flex">
          <div class="w-50">
            <div>
              <label class="fw-bold me-2">Start Time: </label>
              <span>{{ convertTime(schedule.start_time) }}</span>
            </div>
            <div class="d-flex">
              <label class="fw-bold me-2">Days: </label>
              <div class="d-flex gap-2">
                <span
                  class="day-box"
                  :class="{ 'bg-info': schedule.days.includes(day) }"
                  v-for="day in dayNames"
                  :key="day"
                  >{{ day }}
                </span>
              </div>
            </div>
          </div>
          <div class="w-50">
            <div>
              <label class="fw-bold me-2">Duration: </label>
              <span>{{ schedule.duration_min }} minute{{ schedule.duration_min > 1 ? "s" : "" }}</span>
            </div>
            <div>
              <label class="fw-bold me-2">One-Off: </label>
              <span>{{ schedule.one_time ? "Yes" : "No" }}</span>
            </div>
          </div>
        </div>
        <button
          @click="toggleSkipNext(schedule)"
          class="w-100 mt-3 btn btn-warning"
          :class="{ 'btn-danger': schedule.skip_next }"
        >
          {{ schedule.skip_next ? "Unskip Next Occurrence" : "Skip Next Occurrence" }}
        </button>
      </div>
    </modal>

    <h2>Add A Zone</h2>
    <label>Name</label>
    <input v-model="newRelayName" type="text" placeholder="Zone Name" class="form-control mb-2" />
    <label>GPIO Pin</label>
    <input v-model="newRelayGpioPin" type="number" placeholder="GPIO Pin" class="form-control mb-2" />
    <button
      @click="addRelay"
      :disabled="!newRelayName || !newRelayGpioPin || addingRelay"
      class="btn btn-success w-100"
    >
      <span v-if="!addingRelay">Add Relay</span><span v-else class="spinner-border"></span>
    </button>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import Modal from "./components/Modal.vue";
export default {
  components: { Modal },
  name: "App",

  data() {
    return {
      relays: [],
      schedules: [],
      connected: false,
      socket: null,
      newRelayName: "",
      newRelayGpioPin: null,
      addingRelay: false,
      selectedRelay: null,
      addingSchedule: false,
      newSchedule: {
        start_time: null,
        duration_min: null,
        one_time: false,
      },
      dayNames: ["S", "M", "T", "W", "T", "F", "S"],
    };
  },

  methods: {
    connectWs() {
      this.socket = io(`http://${window.location.hostname}:${import.meta.env.VITE_WS_PORT}`);

      this.socket.on("update", (relays) => {
        this.relays = relays;
      });
    },
    getRelays() {
      axios.get("/api/relays").then((response) => {
        this.relays = response.data;
      });
    },
    addRelay() {
      this.addingRelay = true;
      axios
        .post("/api/relays", {
          name: this.newRelayName,
          gpio_pin: this.newRelayGpioPin,
        })
        .then((response) => {
          this.newRelayName = "";
          this.newRelayGpioPin = null;
          this.$toast.success("Zone added");
        })
        .catch((err) => {
          this.$toast.error(err.response.data);
        })
        .finally(() => {
          this.addingRelay = false;
        });
    },
    toggleRelayActive(relay) {
      relay.active = relay.active == 1 ? 0 : 1;
      axios.post(`/api/relays/${relay.id}`, relay).catch((err) => {
        relay.active = relay.active == 1 ? 0 : 1;
        this.$toast.error(err.response.data);
      });
    },
    deleteRelay(relay) {
      axios.delete(`/api/relays/${relay.id}`).then(() => {
        this.$toast.success("Zone deleted");
      });
    },

    createSchedule() {
      axios
        .post(`/api/schedules`, {
          relay_id: this.selectedRelay.id,
          days: [0, 1, 2, 3, 4, 5, 6],
          ...this.newSchedule,
        })
        .then(() => {
          this.newSchedule = {
            start_time: null,
            duration_min: null,
            one_time: false,
          };
          this.addingSchedule = false;
          this.$toast.success("Schedule created");
        });
    },

    convertTime(time) {
      const [H, M] = time.split(":");
      return `${H % 12}:${M} ${H < 12 ? "AM" : "PM"}`;
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

td {
  vertical-align: middle;
}
.day-box {
  width: 24px;
  border-radius: 5px;
  text-align: center;
}
</style>

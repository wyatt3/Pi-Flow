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
      <table class="table">
        <thead>
          <tr>
            <th>Skip Next Occurrence</th>
            <th>Start Time</th>
            <th>Duration</th>
            <th>Status</th>
            <th>One-Off</th>
            <th></th>
            <th></th>
          </tr>
          <template v-for="schedule in selectedRelay.schedules" :key="schedule.id">
            <tr v-if="schedule.editing">
              <td><input type="checkbox" v-model="schedule.skip_next" /></td>
              <td><input type="time" v-model="schedule.start_time" class="form-control" /></td>
              <td>
                <div class="input-group">
                  <input type="number" v-model="schedule.duration_min" min="0" class="form-control" /><span
                    class="input-group-text"
                    >minutes</span
                  >
                </div>
              </td>
              <td>{{ schedule.status }}</td>
              <td class="text-center"><input type="checkbox" v-model="schedule.one_time" /></td>
              <td><button class="btn btn-success bi bi-check" @click="saveSchedule(schedule)"></button></td>
              <td><button class="btn btn-danger bi bi-x" @click="schedule.editing = false"></button></td>
            </tr>
            <tr v-else>
              <td><input type="checkbox" v-model="schedule.skip_next" @change="skipNextOccurrence(schedule)" /></td>
              <td>{{ schedule.start_time }}</td>
              <td>{{ schedule.duration_min }} minutes</td>
              <td>{{ schedule.status }}</td>
              <td class="text-center">{{ schedule.one_time == 1 ? "Yes" : "No" }}</td>
              <td><button class="btn btn-warning bi bi-pencil" @click="editSchedule(schedule)"></button></td>
              <td><button class="btn btn-danger bi bi-trash" @click="deleteSchedule(schedule)"></button></td>
            </tr>
          </template>
          <tr v-if="addingSchedule">
            <td></td>
            <td><input type="time" v-model="newSchedule.start_time" class="form-control" /></td>
            <td>
              <div class="input-group">
                <input type="number" v-model="newSchedule.duration_min" min="0" class="form-control" /><span
                  class="input-group-text"
                  >minutes</span
                >
              </div>
            </td>
            <td>Idle</td>
            <td class="text-center"><input type="checkbox" v-model="newSchedule.one_time" /></td>
            <td><button class="btn btn-success bi bi-check" @click="createSchedule"></button></td>
            <td>
              <button class="btn btn-danger bi bi-x" @click="resetNewSchedule"></button>
            </td>
          </tr>
          <tr v-else>
            <td colspan="4"></td>
            <td colspan="3"><button class="btn btn-info bi bi-plus" @click="addingSchedule = true"></button></td>
          </tr>
        </thead>
      </table>
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
      axios.post(`/api/schedules`, this.newSchedule).then(() => {
        this.newSchedule = {
          start_time: null,
          duration_min: null,
          one_time: false,
        };
        this.addingSchedule = false;
        this.$toast.success("Schedule created");
      });
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
</style>

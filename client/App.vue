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
    <button class="btn btn-primary w-100 mt-3" @click="addingRelay = true"><i class="bi bi-plus"></i>Add Zone</button>
    <modal :open="addingRelay" @toggle="addingRelay = false">
      <h2>Add A Zone</h2>
      <label>Name</label>
      <input v-model="newRelayName" type="text" placeholder="Zone Name" class="form-control mb-2" />
      <label>GPIO Pin</label>
      <input v-model="newRelayGpioPin" type="number" placeholder="GPIO Pin" class="form-control mb-2" />
      <button @click="addRelay" :disabled="!newRelayName || !newRelayGpioPin || loading" class="btn btn-success w-100">
        <span v-if="loading" class="spinner-border"></span><span v-else>Add Zone</span>
      </button>
    </modal>

    <modal :open="selectedRelay" @toggle="selectedRelay = null">
      <h1>Schedules</h1>
      <div class="schedule p-3 mb-3 position-relative" v-for="schedule in selectedRelay.schedules" :key="schedule.id">
        <button class="btn btn-danger delete-schedule bi bi-x" @click="deleteSchedule(schedule)"></button>
        <div class="d-flex flex-wrap">
          <div class="schedule-item">
            <label class="fw-bold me-2">Start Time: </label>
            <span>{{ convertTime(schedule.start_time) }}</span>
          </div>
          <div class="d-flex schedule-item">
            <label class="fw-bold me-2">Days: </label>
            <div class="d-flex gap-2">
              <span
                class="day-box"
                :class="{ 'bg-info': schedule.days.includes(dayNumber) }"
                v-for="(day, dayNumber) in dayNames"
                :key="dayNumber"
                >{{ day }}
              </span>
            </div>
          </div>
          <div class="schedule-item">
            <label class="fw-bold me-2">Duration: </label>
            <span>{{ schedule.duration_min }} minute{{ schedule.duration_min > 1 ? "s" : "" }}</span>
          </div>
          <div class="schedule-item">
            <label class="fw-bold me-2">One-Off: </label>
            <span>{{ schedule.one_time ? "Yes" : "No" }}</span>
          </div>
          <div class="schedule-item">
            <label class="fw-bold me-2">Status: </label>
            <span
              class="px-2 py-1 rounded text-uppercase"
              :class="{
                'bg-warning': schedule.status == 'running',
                'bg-success': schedule.status == 'idle',
                'text-white': schedule.status == 'idle',
              }"
              >{{ schedule.status }}</span
            >
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
      <div v-if="addingSchedule">
        <label class="fw-bold">Start Time: </label>
        <input v-model="newSchedule.start_time" type="time" class="form-control mb-2" />
        <label class="fw-bold">Duration: </label>
        <div class="input-group mb-2">
          <input v-model="newSchedule.duration_min" type="number" class="form-control" />
          <span class="input-group-text">minutes</span>
        </div>
        <label class="fw-bold">Days:</label>
        <div class="d-flex gap-2 mb-2">
          <div v-for="(day, dayNumber) in dayNames" :key="day">
            <button
              @click="toggleDay(newSchedule, dayNumber)"
              class="btn"
              :class="{ 'btn-info': newSchedule.days.includes(dayNumber) }"
            >
              {{ day }}
            </button>
          </div>
        </div>
        <div class="mb-2">
          <label class="fw-bold me-2">One-Off: </label>
          <input v-model="newSchedule.one_time" type="checkbox" class="form-check-input" />
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-danger w-50" @click="resetNewSchedule">Cancel</button>
          <button
            class="btn btn-success w-50"
            @click="createSchedule"
            :disabled="!newSchedule.start_time || !newSchedule.duration_min || loading"
          >
            <span v-if="loading" class="spinner-border"></span><span v-else>Save</span>
          </button>
        </div>
      </div>
      <button v-else class="btn btn-success w-100 mt-3" @click="addingSchedule = true">Add New Schedule</button>
    </modal>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import Countdown from "./components/Countdown.vue";
import Modal from "./components/Modal.vue";
export default {
  components: {
    Countdown,
    Modal,
  },
  name: "App",

  data() {
    return {
      loading: false,
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
        days: [],
      },
      dayNames: ["S", "M", "T", "W", "T", "F", "S"],
    };
  },

  methods: {
    connectWs() {
      this.socket = io(`http://${window.location.hostname}:${import.meta.env.VITE_WS_PORT}`);

      this.socket.on("update", (relays) => {
        this.relays = relays;
        if (this.selectedRelay) {
          this.selectedRelay = this.relays.find((relay) => relay.id == this.selectedRelay.id);
        }
      });
    },
    getRelays() {
      axios.get("/api/relays").then((response) => {
        this.relays = response.data;
      });
    },
    addRelay() {
      this.loading = true;
      axios
        .post("/api/relays", {
          name: this.newRelayName,
          gpio_pin: this.newRelayGpioPin,
        })
        .then((response) => {
          this.newRelayName = "";
          this.newRelayGpioPin = null;
          this.addingRelay = false;
          this.$toast.success("Zone added");
        })
        .catch((err) => {
          this.$toast.error(err.response.data);
        })
        .finally(() => {
          this.loading = false;
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
      this.loading = true;
      axios
        .post(`/api/schedules`, {
          relay_id: this.selectedRelay.id,
          ...this.newSchedule,
        })
        .then(() => {
          this.newSchedule = {
            start_time: null,
            duration_min: null,
            one_time: false,
            days: [],
          };
          this.addingSchedule = false;
          this.$toast.success("Schedule created");
        })
        .catch((err) => {
          this.$toast.error(err.response.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    resetNewSchedule() {
      this.newSchedule = {
        start_time: null,
        duration_min: null,
        one_time: false,
        days: [],
      };
      this.addingSchedule = false;
    },
    toggleSkipNext(schedule) {
      schedule.skip_next = schedule.skip_next == 1 ? 0 : 1;
      axios.post(`/api/schedules/${schedule.id}`, schedule).catch((err) => {
        schedule.skip_next = schedule.skip_next == 1 ? 0 : 1;
        this.$toast.error(err.response.data);
      });
    },
    updateSchedule() {},
    deleteSchedule(schedule) {
      axios
        .delete(`/api/schedules/${schedule.id}`)
        .then(() => {
          this.$toast.success("Schedule deleted");
        })
        .catch((err) => {
          this.$toast.error(err.response.data);
        });
    },

    toggleDay(schedule, day) {
      if (schedule.days.includes(day)) {
        schedule.days = schedule.days.filter((d) => d !== day);
      } else {
        schedule.days.push(day);
      }
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

.schedule {
  border: 1px solid #ccc;
  border-radius: 5px;
}

.schedule-item {
  width: 100%;
  display: flex;
  align-items: center;
}

.delete-schedule {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  padding: 0;
}

@media screen and (min-width: 600px) {
  .schedule-item {
    width: 50%;
  }
}
</style>

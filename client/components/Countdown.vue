<template>
  <span>{{ remaining }}</span>
</template>

<script>
export default {
  props: {
    startTimestamp: Number,
    durationMin: Number,
  },

  data() {
    return {
      remaining: "",
      timer: null,
    };
  },

  mounted() {
    this.update();
    this.timer = setInterval(this.update, 1000);
  },

  beforeUnmount() {
    clearInterval(this.timer);
  },

  methods: {
    update() {
      const end = this.startTimestamp + this.durationMin * 60 * 1000;
      const diff = end - Date.now();

      if (diff <= 0) {
        this.remaining = "00:00";
        clearInterval(this.timer);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      this.remaining = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    },
  },
};
</script>

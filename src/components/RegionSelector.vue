<template>
  <div class="region-selector">
    <div 
      v-for="region in regions" 
      :key="region.id"
      class="region-button"
      :class="{ 
        selected: selectedRegion === region.id,
        'highlight-pulse': highlightRegion === region.id
      }"
      @click="selectRegion(region.id)"
      :style="{
        '--button-color': region.color,
        '--hover-color': region.hoverColor
      }"
    >
      <div class="region-icon">
        <div class="icon-container">
          <div class="icon-inner">
            <component :is="region.icon" />
          </div>
        </div>
      </div>
      <div class="region-label">{{ region.name }}</div>
      <div class="selection-indicator" v-if="selectedRegion === region.id"></div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
const AsiaIcon = defineComponent({
  render() {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.2,16.2l-1.4,1.4l-2.1-2.1l-2.1,2.1l-1.4-1.4 l2.1-2.1L8.2,12l1.4-1.4l2.1,2.1l2.1-2.1l1.4,1.4l-2.1,2.1L16.2,16.2z" fill="currentColor"/>
      </svg>
    );
  }
});

const EuropeIcon = defineComponent({
  render() {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16.7,13.3l-4,4c-0.2,0.2-0.5,0.3-0.7,0.3 s-0.5-0.1-0.7-0.3l-4-4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0L12,14.6l3.3-3.3c0.4-0.4,1-0.4,1.4,0S17.1,12.9,16.7,13.3z" fill="currentColor"/>
      </svg>
    );
  }
});

const ArabIcon = defineComponent({
  render() {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M13,17h-2v-2h2V17z M13,13h-2V7h2V13z" fill="currentColor"/>
      </svg>
    );
  }
});

const AfricaIcon = defineComponent({
  render() {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M16,15H8c-0.6,0-1-0.4-1-1s0.4-1,1-1h8c0.6,0,1,0.4,1,1 S16.6,15,16,15z" fill="currentColor"/>
      </svg>
    );
  }
});

const LatinIcon = defineComponent({
  render() {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M14,16.5c0,0.3-0.2,0.5-0.5,0.5h-3 C10.2,17,10,16.8,10,16.5v-9C10,7.2,10.2,7,10.5,7h3c0.3,0,0.5,0.2,0.5,0.5V16.5z" fill="currentColor"/>
      </svg>
    );
  }
});

export default {
  name: 'RegionSelector',
  
  components: {
    AsiaIcon,
    EuropeIcon,
    ArabIcon,
    AfricaIcon,
    LatinIcon
  },
  
  props: {
    selectedRegion: {
      type: String,
      default: null
    },
    highlightRegion: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      regions: [
        {
          id: 'asia',
          name: 'Asia and the Pacific',
          color: '#3498db',
          hoverColor: '#2980b9',
          icon: 'AsiaIcon'
        },
        {
          id: 'europe',
          name: 'Europe and North America',
          color: '#9b59b6',
          hoverColor: '#8e44ad',
          icon: 'EuropeIcon'
        },
        {
          id: 'arab',
          name: 'Arab States',
          color: '#e67e22',
          hoverColor: '#d35400',
          icon: 'ArabIcon'
        },
        {
          id: 'africa',
          name: 'Africa',
          color: '#2ecc71',
          hoverColor: '#27ae60',
          icon: 'AfricaIcon'
        },
        {
          id: 'latin',
          name: 'Latin America and the Caribbean',
          color: '#e74c3c',
          hoverColor: '#c0392b',
          icon: 'LatinIcon'
        }
      ]
    };
  },
  
  methods: {
    selectRegion(regionId) {
      const newRegion = this.selectedRegion === regionId ? null : regionId;
      this.$emit('region-change', newRegion);
    }
  }
};
</script>

<style scoped>
.region-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  padding: 20px;
  background-color: #2c3e50;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.region-button {
  position: relative;
  width: 220px;
  height: 120px;
  background: linear-gradient(145deg, #34495e, #2c3e50);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid transparent;
}

.region-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border-color: var(--button-color);
}

.region-button.selected {
  transform: translateY(-10px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.4);
  border: 2px solid var(--button-color);
  background: linear-gradient(145deg, #3a506b, #2c3e50);
}

.region-icon {
  margin-bottom: 10px;
  z-index: 2;
}

.icon-container {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.region-button:hover .icon-container {
  background-color: var(--button-color);
  transform: scale(1.1);
}

.region-button.selected .icon-container {
  background-color: var(--button-color);
  transform: scale(1.15);
}

.icon-inner {
  width: 30px;
  height: 30px;
  color: white;
}

.region-label {
  color: white;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
  padding: 0 10px;
  z-index: 2;
}

.selection-indicator {
  position: absolute;
  bottom: 10px;
  width: 30px;
  height: 4px;
  background-color: var(--button-color);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.highlight-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .region-button {
    width: 200px;
    height: 110px;
  }
}

@media (max-width: 992px) {
  .region-button {
    width: 180px;
    height: 100px;
  }
  
  .region-label {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .region-selector {
    gap: 10px;
  }
  
  .region-button {
    width: 160px;
    height: 90px;
  }
  
  .icon-container {
    width: 40px;
    height: 40px;
  }
  
  .icon-inner {
    width: 24px;
    height: 24px;
  }
}
</style>
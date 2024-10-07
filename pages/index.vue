<template>
  <section class="flex flex-col">
    <Map.OlMap
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      style="height: 70vh;"
    >
      <Map.OlView
        ref="view"
        :zoom="zoom"
        :center="center"
        :projection="projection"
      />

      <Layers.OlTileLayer>
        <Sources.OlSourceOsm />
      </Layers.OlTileLayer>

      <Layers.OlVectorLayer>
        <Sources.OlSourceVector
          :features="fStatesCoordinates"
          :projection="projection"
        >
          <template
            v-for="disasterPoints in momentumPoints"
          >
            <Map.OlFeature
              v-for="disaster in disasterPoints"
            >
              <Geometries.OlGeomPoint :coordinates="disaster.coordinates" />
              <Styles.OlStyle>
                <Styles.OlStyleIcon :src="disaster.img" :scale=".5" />
              </Styles.OlStyle>
            </Map.OlFeature>
          </template>
        </Sources.OlSourceVector>

        <Styles.OlStyle :override-style-function="getStateSyle" />
      </Layers.OlVectorLayer>

      <Interactions.OlInteractionSelect
        :filter="selectInteactionFilter"
        :condition="pointerMove"
      />
    </Map.OlMap>

    <section class="grow flex flex-col border-t border-t-black/50">
      <section
        v-if="momentums.length === 0"
        class="flex flex-col gap-4"
      >
        <section class="grid auto-cols-fr grid-flow-col gap-10 px-6 py-4">
          <div
            v-for="disaster in disasters"
            :key="disaster.id"
            class="flex flex-col gap-2"
          >
            <div class="flex gap-4 items-center">
              <input
                v-model="selectedDisaster"
                :id="disaster.id"
                type="radio"
                class="scale-150"
                :value="disaster"
              >

              <label :for="disaster.id" class="text-3xl font-medium">
                {{ disaster.name }}
              </label>

              <NuxtImg :src="`${disaster.slug}.png`" width="25" height="25" />
            </div>

            <p>
              {{ disaster.description.body }}
            </p>
          </div>
        </section>

        <div class="flex items-center justify-center">
          <button
            @click="addMomentum"
            class="px-6 py-2 bg-blue-500 text-white font-bold rounded-md"
          >
            Iniciar Simulação
          </button>
        </div>
      </section>

      <section
        v-else
        class="flex flex-col gap-4"
      >
        <section class="bg-white shadow-lg rounded-full px-6 py-4 flex items-center gap-6 -translate-y-1/2 mx-auto">
          <Icon
            :name="GLOBAL_ICONS.arrow_left"
            class="text-4xl"
            :class="actual === 0 ? 'text-gray-300 pointer-events-none' : 'text-blue-500 cursor-pointer'"
            @click="previousMomentum"
          />

          <div class="flex items-center gap-4 text-lg">
            <span
              v-for="momentum in visibleMomentums"
              :key="momentum"
              class="cursor-pointer hover:underline decoration-2"
              :class="actual === momentum - 1 ? 'text-blue-500 decoration-primary-500 font-bold' : 'text-gray-300'"
              @click="actual = momentum - 1"
            >
              {{ momentum }}
            </span>
          </div>

          <Icon
            :name="GLOBAL_ICONS.arrow_right"
            class="text-4xl text-blue-500 cursor-pointer"
            @click="nextMomentum"
          />
        </section>

        <section class="grid auto-cols-fr grid-flow-col gap-10 px-6 py-4 -translate-y-12">
          <div
            v-for="disaster in disasters"
            :key="disaster.id"
            class="flex flex-col gap-2"
          >
            <div class="flex gap-4 items-center">
              <NuxtImg :src="`${disaster.slug}.png`" width="30" height="30" />

              <label :for="disaster.id" class="text-lg font-medium">
                {{ disaster.name }}
              </label>
            </div>

            <p>
              {{ disaster.predict_description.body }}
            </p>
          </div>
        </section>
      </section>
    </section>
  </section>
</template>

<script setup>

  import { centroid } from '@turf/turf';
  import { Map, Layers, Sources, Interactions, Styles, Geometries } from 'vue3-openlayers';
  import { pointerMove } from 'ol/events/condition';
  import { Style, Stroke } from "ol/style";
  import GeoJSON from 'ol/format/GeoJSON';
  import br_states_data from '~/app/geo/data/br_states.json';
  import disasters_data from '~/app/geo/data/disasters.json';
  import states_data from '~/app/geo/data/states.json';
  import { GLOBAL_ICONS } from '~/shared/packages/constants/icons';


  // Settings
  const projection = ref('EPSG:4326');
  const center = ref([-50, -14]);
  const zoom = ref(4.5);


  // Data
  const fStatesCoordinates = br_states_data.features.map((feature) => {
    return new GeoJSON().readFeature(feature);
  });


  // Hover Interaction
  const selectedUF = ref();

  const selectInteactionFilter = (feature) => {
    if (feature.values_.UF_05 != undefined) selectedUF.value = feature.values_.UF_05;

    return selectedUF.value === feature.values_.UF_05;
  };


  // States
  const states = ref(states_data);

  function getStateByUF(uf) {
    return states.value.find(state => state.uf === uf);
  }

  function getStateFrontiers(uf) {
    const state = getStateByUF(uf);
    return state ? state.frontiers : [];
  }


  // Disasters
  const disasters = ref(disasters_data);
  const selectedDisaster = ref();

  // Steps
  const momentums = ref([]);
  const actual = ref(0);

  function previousMomentum() {
    if (actual.value > 0) actual.value--;
  }

  function nextMomentum() {
    if (actual.value < momentums.value.length - 1) actual.value++;
    else addMomentum();
  }

  const visibleMomentums = computed(() => {
    const half = Math.floor(5 / 2);
    let start = actual.value - half;
    let end = actual.value + half;

    // Ajuste os limites caso eles ultrapassem o começo ou o fim do array
    if (start < 1) {
      start = 1;
      end = Math.min(5, momentums.value.length);
    } else if (end > momentums.value.length) {
      end = momentums.value.length;
      start = Math.max(1, momentums.value.length - 5 + 1);
    }

    // Crie um array com os números dentro do intervalo
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  function shouldCreateNewDisaster(possibility) {
    const chance = Math.random() * 100; // Gera um número aleatório entre 0 e 100
    return chance <= possibility; // Retorna verdadeiro se a probabilidade for atendida
  }

  function addMomentum() {
    if (actual.value === 0) {

      if (!selectedDisaster.value) throw new Error('Selecione um desastre para iniciar a simulação');
      if (!selectedUF.value) throw new Error('Selecione um estado para iniciar a simulação');
      momentums.value.push({ [selectedUF.value]: selectedDisaster.value }); // Um único desastre por estado

    } else {

      // Cria um novo momentum baseado no momento anterior
      const actualMomentum = momentums.value[momentums.value.length - 1];
      const newMomentum = _cloneDeep(actualMomentum); // Copia o momentum anterior

      Object.keys(actualMomentum).forEach(uf => {
        const disaster = actualMomentum[uf];

        if (disaster) {
          // Determina o número de desastres que vão se espalhar
          const [minSpread, maxSpread] = disaster.spread_possibility;
          const spreadCount = _random(minSpread, maxSpread);

          if (disaster.post_possible) {
            if (shouldCreateNewDisaster(disaster.post_possible.possibility)) {
              // Cria um novo desastre com o ID específico naquela localização (UF)
              newMomentum[uf] = disasters.value.find(d => d.id === disaster.post_possible.id);
            }
          } else {
            newMomentum[uf] = undefined;
            delete newMomentum[uf];
          }

          // Obtém as fronteiras do estado atual (UF)
          const frontiers = getStateFrontiers(uf);

          if (frontiers.length > 0) {
            const spreadTo = spreadCount >= frontiers.length ? frontiers : frontiers.slice(0, spreadCount);

            spreadTo.forEach(frontierUF => {
              if (!newMomentum[frontierUF]) newMomentum[frontierUF] = disaster;
            });
          }
        }
      });

      momentums.value.push(newMomentum);
    }

    actual.value = momentums.value.length - 1;
  }

  const momentumPoints = computed(() => {
    return Object.keys(momentums.value[actual.value] ?? {}).map((uf) => {
      const coordinates = centroid(br_states_data.features.find(feature => feature.properties.UF_05 === uf)).geometry.coordinates;

      const momentumsDisaster = {};

      const disaster = momentums.value[actual.value][uf];
      if (disaster) {
        momentumsDisaster[disaster.id] = {
          coordinates: [coordinates[0], coordinates[1]],
          img: `/_ipx/_/${disaster.slug}.png`
        };
      }

      return Object.values(momentumsDisaster).map((disaster, idx) => ({
        ...disaster,
        coordinates: [disaster.coordinates[0] + (idx * .5), disaster.coordinates[1]]
      }))
    });
  });

  function getStateSyle(feature){
    return new Style({
      stroke: new Stroke(
        selectedUF.value == feature.values_.UF_05 ?
        {
          color: 'blue',
          width: 3
        }
          :
        {
          color: 'green',
          width: 1
        }
      )
    });
  }

</script>

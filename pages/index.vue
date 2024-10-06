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
                <Styles.OlStyleCircle :radius="disaster.radius">
                  <Styles.OlStyleFill :color="disaster.color" />
                </Styles.OlStyleCircle>
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

    <section class="grow flex flex-col py-4 px-4 gap-6 border-black/50">
      <UtilsStepperHeader
        v-model:actual="actual"
        :headers="headers"
      >
        <template #add>
          <div
            class="text-white rounded-full flex items-center justify-center h-8 w-8 bg-primary-500 hover:bg-primary-600 shadow shadow-[white] hover:scale-105 cursor-pointer"
            @click="addMomentum"
          >
            <Icon :name="GLOBAL_ICONS.plus" class="text-xl" />
          </div>
        </template>
      </UtilsStepperHeader>

      <section v-if="actual === 0" class="flex flex-wrap *:grow gap-4 px-5">
        <div
          v-for="disaster in disasters"
          :key="disaster.id"
          class="font-bold border border-white/10 hover:border-white/20 rounded-full p-2 text-center cursor-pointer text-nowrap"
          @click="selectedDisaster = disaster"
        >
          {{ disaster.name }}
        </div>
      </section>

      <section v-else-if="selectedUF">
        <pre>
          {{ _get(momentums, `${actual}.${selectedUF}`) }}
        </pre>
      </section>

      {{selectedUF}}
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
  const headers = ref(['Momento do Desastre']);
  const momentums = ref([undefined]);
  const actual = ref(0);

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
      const actualMomentum = momentums.value[actual.value];
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

    headers.value.push('Momento ' + (actual.value + 1));
    actual.value++;
  }

  const disasterColors = {
    1: 'red',
    2: 'brown',
    3: 'black',
    4: 'yellow',
    5: 'blue',
    6: 'purple',
    7: 'orange'
  };

  function countQtt(sourceObj, qttObj, id) {
    if (sourceObj[id] == undefined) {
      qttObj[id] = 0;
    } else qttObj[id]++;

    return qttObj[id];
  }

  const momentumPoints = computed(() => {
    return Object.keys(momentums.value[actual.value] ?? {}).map((uf) => {
      const coordinates = centroid(br_states_data.features.find(feature => feature.properties.UF_05 === uf)).geometry.coordinates;

      const momentumsDisaster = {};
      const momentumsDisasterQtt = {};

      const disaster = momentums.value[actual.value][uf];
      if (disaster) {
        momentumsDisaster[disaster.id] = {
          color: disasterColors[disaster.id],
          coordinates: [coordinates[0], coordinates[1]],
          radius: 5 + (countQtt(momentumsDisaster, momentumsDisasterQtt, disaster.id) * 0.1)
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
      stroke: new Stroke({
        color: selectedUF.value == feature.values_.UF_05 ? 'blue' : 'green',
        width: selectedUF.value == feature.values_.UF_05 ? 3 : 1
      })
    });
  }

</script>

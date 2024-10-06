# Vestimentor

## Iniciando Projeto

Declare as variáveis de ambiente

```bash
cp .env.config .env
```

Instale e suba a aplicação

```bash
make install up
```

## Módulos

### [**@formkit/auto-animate/nuxt**](https://nuxt.com/modules/auto-animate)

Basta usar v-auto-animate em qualquer tag que possui algum tipo mudança/transição em seu funcionamento

### [**@nuxtjs/tailwindcss**](https://nuxt.com/modules/tailwindcss)

Funciona da mesma forma que o tailwindcss comum

### [**@nuxtjs/color-mode**](https://nuxt.com/modules/color-mode)

Permite mudar o modo de cor dentro da aplicação a critério do usuário

### [**@pinia/nuxt**](https://nuxt.com/modules/pinia)

Biblioteca de gerência de estado indicada pela empresa do Vue, assim como do Nuxt

### [**nuxt-icon**](https://nuxt.com/modules/icon)

Perimte user qualquer ícone disponível no site [Icônes](https://icones.js.org/) por meio da tag \<Icon /> passando o nome do ícone como atributo name 

### [**nuxt-lodash**](https://nuxt.com/modules/lodash)

Todas as funções do lodash estão disponíveis, mas não é preciso colocar `_.(função)`, sendo dispensável o ponto, ficando `_(função)`

### [**nuxt-primevue**](https://nuxt.com/modules/primevue)

Todos os componentes do PrimeVue estão disponíveis colocando `PrimeVue` antes do nome, assim como as diretivas estão disponíveis colocando `pv-` antes do nome, ficando `v-pv-diretiva`

### [**@nuxt/image**](https://nuxt.com/modules/image)

Módulo oficial do Nuxt para uso de imagem, use a tag NuxtImg para qualquer imagem no sistema

## Arquitetura


### Módulos e Barris

Os barris servem como ponto de entrada para importações e exportações dos recursos de um módulo. Os módulos estão localizados na pasta *app/modules*. Cada pasta com um nome no singular representa um módulo ou um submódulo, enquanto pastas no plural representam características do módulo atual. Por exemplo, *school/repositories* são os **repositórios** de school, e *school/class* é o submódulo chamado *class* do módulo *school*. Todo módulo deve possuir um arquivo index que exporta todas as suas características. Nenhum outro código deve importar diretamente o endereço de uma característica de um módulo.

```ts

  export { useInfoRepository } from '@modules/info/repositories/infoRepository.ts';

  export { type InfoListItemInterface, InfoListItemModel } from '@modules/info/models/infoListItem.ts';

```

### Model

Os models representam a estrutura dos dados manipulados no sistema. Eles encapsulam as propriedades e comportamentos relacionados a esses dados. A criação de um modelo segue os seguintes passos:

1. **Interface:** Define os tipos de dados que serão recebidos da API. Esta interface representa o formato exato dos dados fornecidos pela API. O nome da Interface segue o padrão (nome_do_objeto_da_rota) + Interface.

2. **Model:** Representa os dados manipulados internamente no sistema, recebidos da API. O modelo recebe como parâmetro um objeto que corresponde à interface definida. Isso garante que o modelo trabalhe apenas com os dados esperados e facilita a manutenção do código. O nome do Model segue o padrão (nome_do_objeto_da_rota) + Model.

```ts

  export interface InfoInterface {
    ...
  };

  export class InfoModel {
    ...

    constructor({
      ...
    }: InfoInterface){
      ...
    }
  };

```

### Client

Os clients são responsáveis por fornecer as funções de requisições para comunicação com a API, são objetos que por padrão devem ter no mínimo quatro funções chamadas get, post, put e delete e retornam responses no formato padrão do sistema. Diferentes clients são usados para se comunicar com diferentes APIs e eles são responsáveis por, independentemente da API, formatar a response para o padrão do sistema.

### Repository

Os repositórios fornecem uma camada de controle sobre a comunicação com a API, onde as rotas serão definidas e nomeadas.

A função defineRepository deve ser usada para criar um repositório, função esta que recebe como primeiro parâmetro uma função que retorna um client e como segundo parâmetro uma função arrow que recebe automaticamente o client instanciado internamente como parâmetro. As rotas devem ser criadas por meio de funções que usam o client para fazer requisições, devendo passar como tipo para a função usada do client a interface de um Model.

Por padrão o respositórios agrupam rotas com a mesma raíz, sendo um padrão guardar essa raíz em uma const chamada *url*.

```ts

  import type { InfoListItemInterface } from '@modules/info';

  const url = 'info/'

  export const useInfoRepository = defineRepository(useClient, (client) => {
    function getInfos(params: object){
      return client.get<InfoListItemInterface[]>(url, params);
    }

    return {
      getInfos
    };
  })

```

### Mapper

Os mappers são responsáveis por importar isoladamente uma rota de um repositório e instanciar o model com o retorno da API. Existem duas formas de instânciar o retorno da API, onde o primeiro parâmetro sempre será a rota e o segundo o Model:

1. **useSingleInstantiator:** Utilizado no caso onde a api retorna um único objeto, utilizado em rotas que retornam detalhes de algo (como uma escola ou matrícula).
 
2. **useMultipleInstantiator:** Utilizado no caso onde a api retona um array de objetos, utilizado em rotas que listam algo (como uma lista de alunos ou turmas).

O nome do Mapper deve seguir a nomeclatura `(nome_da_rota) + (nome_do_model) + Mapper`.

```ts

  // Requisição GET instanciando um único objeto de retorno

  import { InfoDetailModel, useInfoRepository } from '@modules/info';

  export const useGetInfoInfoDetailMapper = defineMapper(() => {
    const { getInfo } = useInfoRepository();

    const getInfoInfoDetailMapper = useSingleInstantiator(getInfo, InfoDetailModel);

    return {
      getInfoInfoDetailMapper
    };
  });

  // Requisição GET instanciando vários objetos de retorno

  import { InfoListItemModel, useInfoRepository } from '@modules/info';

  export const useGetInfosInfoListItemMapper = defineMapper(() => {
    const { getInfos } = useInfoRepository();

    const getInfosInfoListItemMapper = useMultipleInstantiator(getInfos, InfoListItemModel);

    return {
      getInfosInfoListItemMapper
    };
  });

```

### Service

Os services são responsáveis por importar isoladamente uma rota de um repositório ou de um mapper e aplicar regras de negócio no funcionamento de uma requisição.

O nome do Service deve seguir a nomeclatura `(nome_do_mapper) + Service` ou `(nome_da_rota) + Service`.

```ts

  // Requisição para criar informação

  import { useStoreInfoInfoDetailMapper } from '@modules/info';

  export const useStoreInfoService = defineService(() => {
    const { storeInfoInfoDetailMapper } = useStoreInfoInfoDetailMapper();

    function storeInfoService(body: object){
      return storeInfoInfoDetailMapper(body);
    }

    return {
      storeInfoService
    };
  });

```

### Handler

Os handlers são responsáveis por fornecer as informações advindas dos services para as views. Eles encapsulam a lógica dos Services e chamam funções request de acordo com a necessidade de cada caso. Os tipos de Request utilizados no sistema são:

1. **Request:** Guarda os dados, os erros, a função para chamar a requisição, as últimas mensagens de erro e sucesso e notifica automaticamente qualquer erro.

2. **LoadingRequest:** Baseado no Request, mas possui o estado de carregamento.

3. **FormRequest:** Baseado no LoadingRequest, mas notifica os sucessos e não é chamada automaticamente no onMounted.

4. **MainRequest:** Baseada no LoadingRequest, mas possui o ready, que serve para travar a tela durante o carregamento de uma informação muito importante para o funcionamento da view. No máximo uma MainRequest pode ser usada por tela.

5. **PaginatedRequest:** Baseado no LoadingRequest, mas possui características mais complexas:

    1. **Search:** Formulário que é passado para a requisição e faz o filtro da lista.

    2. **Pagination:** Paginação da requisição, deve ser passada diretamente para o componente que controla a paginação.

    3. **ForceSearch:** Função para forçar o evento de realizar uma pesquisa independentemente do timer automático.

O nome do handler deve seguir a nomeclatura `(nome_da_rota) + (nome_do_request) + Handler`

```ts

  export const useGetInfosPaginatedRequestHandler = (per_page: number) => {
    const { getInfosService } = useGetInfosService();

    return usePaginatedRequest(getInfosService, per_page);
  }

```

### Fluxo

Ao criar novas rotas para o sistema, o seguinte fluxo padrão deve ser seguido:

1. **Model:** Primeiro, crie uma interface para os dados da API e crie um modelo que representa esses dados internamente.

2. **Repository:** Segundo, crie um repositório para controlar a comunicação com a API, definindo e nomeando as rotas.

3. **Mapper:** Terceiro, isole uma rota do repositório e chame uma função do instanciador para instanciar o Model referente ao objeto desejado.

4. **Service:** Quarto, encapsule a função do Mapper para aplicar regras de negócio sobre ela, podendo utilizar um DTO.

5. **Handler:** Quinto, retorne as informações dos serviços para as views, encapsulando a lógica dos serviços e chamando a função request necessária no onMounted por padrão.

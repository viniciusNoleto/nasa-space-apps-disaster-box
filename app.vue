<template>
  <section class="flex flex-col max-w-[100vw] min-h-[100vh]">
    <NuxtLoadingIndicator :color="PRIMARY_COLOR" />

    <NuxtPage :page-key="route => [route.path, route.query?.fr ?? 0].join('#')" />
  </section>
</template>


<script setup>

  import { SYSTEM_NAME } from '~/shared/packages/constants/system';
  import { PRIMARY_COLOR } from './shared/packages/constants/colors';

  /**
   *
   *                       _oo0oo_
   *                      o8888888o
   *                      88" . "88
   *                      (| -_- |)
   *                      0\  =  /0
   *                    ___/`---'\___
   *                  .'\\||     ||//'.
   *                 / \||||  :  |||// \
   *                / _||||| -:- |||||_ \
   *               |   | \\\  -  /// |   |
   *               | \_|  ''\---/''  |_/ |
   *               \  .-\__  '-'  ___/-. /
   *             ___'. .'  /--.--\  `. .'___
   *          ."" '<  `.___\_<|>_/___.' >' "".
   *         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
   *         \  \ `_.   \_ __\ /__ _/   .-` /  /
   *       ===`-.____`.___ \_____/___.-`___.-'===
   *                       `=---='
   *
   *     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   *
   *               Buddha Bless:  "No Bugs"
   *
   */

  useHead({
    titleTemplate: (title) => title ? `${title} | ${SYSTEM_NAME}` : SYSTEM_NAME,
  });

</script>l


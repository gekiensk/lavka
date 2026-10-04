// Настройка pm2 — менеджера процессов, который держит сайт запущенным и перезапускает после сбоя.
// Запуск:   pm2 start deploy/ecosystem.config.cjs
// Автозапуск после перезагрузки сервера: pm2 save && pm2 startup (и выполнить команду, которую он покажет)
module.exports = {
  apps: [
    {
      name: "santeh-lavka",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1", // слушаем только локально, снаружи — через nginx
      env: { NODE_ENV: "production" },
      max_memory_restart: "700M",
    },
  ],
};

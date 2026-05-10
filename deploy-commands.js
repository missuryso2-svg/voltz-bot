const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = 'SEU_CLIENT_ID';
const GUILD_ID = 'SEU_SERVER_ID';

const commands = [

  new SlashCommandBuilder()
    .setName('registrar_campeonato')
    .setDescription('Registrar partidas de campeonato')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade de partidas')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('ranked_win')
    .setDescription('Adicionar vitória ranked em line')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade de wins')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Ver estatísticas do time')

];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log('Comandos atualizados!');
})();
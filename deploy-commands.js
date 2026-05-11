require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Ping'),
  new SlashCommandBuilder().setName('recrutamento').setDescription('Abrir recrutamento'),
  new SlashCommandBuilder().setName('fechar_recrutamento').setDescription('Fechar recrutamento')
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log('✅ Comandos registrados');
})();